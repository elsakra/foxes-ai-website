import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeUsPhone } from "@/lib/phone";
import { sendLeadConfirmation } from "@/lib/resend";
import { sendKickoffSms } from "@/lib/twilio";
import { slackNewLead } from "@/lib/slack";
import { sendMetaLeadEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

/** Allowed browser origins for cross-origin POST /api/leads. Env merges with these defaults so production works without configuring Vercel for foxes.ai. */
const DEFAULT_LEAD_FORM_ORIGINS = [
  "https://foxes.ai",
  "https://www.foxes.ai",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

function allowedLeadFormOrigins(): string[] {
  const raw =
    process.env.ONBOARDING_ALLOWED_ORIGINS ?? process.env.FUNNEL_ALLOWED_ORIGINS ?? "";
  const fromEnv = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set([...fromEnv, ...DEFAULT_LEAD_FORM_ORIGINS])];
}

function leadFormCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = allowedLeadFormOrigins();
  if (origin && allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return {};
}

/** Store a display-safe URL; prepend https:// when no scheme; keep raw if unparseable */
function normalizeExistingWebsiteUrl(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return t.slice(0, 500);
    return u.toString().slice(0, 500);
  } catch {
    return t.slice(0, 500);
  }
}

const LeadSchema = z.object({
  businessName: z.string().min(1).max(400),
  industry: z.string().min(1).max(400),
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  /** Honeypot — must be empty */
  website: z.string().optional(),
  /** Optional current / old business site (not the honeypot) */
  existingWebsiteUrl: z.string().max(500).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
});

export function OPTIONS(req: Request) {
  const h = leadFormCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: h });
}

export async function POST(req: Request) {
  const cors = leadFormCorsHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400, headers: cors });
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200, headers: cors });
  }

  const phone = normalizeUsPhone(parsed.data.phone);
  const firstName = parsed.data.fullName.trim().split(/\s+/)[0] ?? "there";

  const normalizedSite = normalizeExistingWebsiteUrl(parsed.data.existingWebsiteUrl);
  const intake: Record<string, unknown> = {};
  if (normalizedSite) intake.existing_website_url = normalizedSite;

  const supabase = createServiceRoleClient();
  const insertPayload = {
    business_name: parsed.data.businessName.trim(),
    industry: parsed.data.industry.trim(),
    full_name: parsed.data.fullName.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    phone,
    utm_source: parsed.data.utm_source ?? null,
    utm_medium: parsed.data.utm_medium ?? null,
    utm_campaign: parsed.data.utm_campaign ?? null,
    utm_content: parsed.data.utm_content ?? null,
    ...(Object.keys(intake).length ? { intake } : {}),
  };

  const insert = await supabase.from("leads").insert(insertPayload).select("id").single();

  if (insert.error) {
    console.error(insert.error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500, headers: cors });
  }

  const leadId = insert.data.id as string;
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;

  const siteLine = normalizedSite ? ` · Site: ${normalizedSite}` : "";

  /* SMS + email run for every saved lead; optional website only enriches intake — it never gates notifications. */
  await Promise.all([
    sendLeadConfirmation({
      to: parsed.data.email,
      firstName,
      businessName: parsed.data.businessName,
    }).catch((e) => {
      console.error("[leads] confirmation email failed", e);
    }),
    sendKickoffSms(phone, firstName).catch((e) => {
      console.error("[leads] kickoff SMS failed", e);
    }),
    slackNewLead(
      `🚨 NEW LEAD: ${parsed.data.fullName} — ${parsed.data.businessName} (${parsed.data.industry}). Call within ~5 min. Phone: ${phone} · Email: ${parsed.data.email} · Lead ID \`${leadId}\`${siteLine}`
    ).catch((e) => {
      console.error("[leads] slack notify failed", e);
    }),
    sendMetaLeadEvent({
      leadId,
      email: parsed.data.email,
      phone,
      eventSourceUrl: `${origin}/onboarding`,
    }).catch((e) => {
      console.error("[leads] Meta CAPI failed", e);
    }),
  ]);

  return NextResponse.json({ ok: true, leadId }, { headers: cors });
}
