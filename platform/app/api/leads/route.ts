import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeUsPhone } from "@/lib/phone";
import { sendLeadConfirmation } from "@/lib/resend";
import { sendKickoffSms } from "@/lib/twilio";
import { slackNewLead } from "@/lib/slack";
import { sendMetaLeadEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

function allowedLeadFormOrigins(): string[] {
  const raw =
    process.env.ONBOARDING_ALLOWED_ORIGINS ?? process.env.FUNNEL_ALLOWED_ORIGINS ?? "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
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

const SnapshotSchema = z
  .object({
    place_id: z.string(),
    display_name: z.string(),
    formatted_address: z.string().nullable().optional(),
    formatted_phone: z.string().nullable().optional(),
    international_phone: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    user_ratings_total: z.number().nullable().optional(),
    secondary_types: z.array(z.string()).optional(),
    photo_url: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
  })
  .passthrough();

const LeadSchema = z.object({
  businessName: z.string().min(1).max(400),
  industry: z.string().min(1).max(400),
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  /** Honeypot — must be empty */
  website: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  google_place_id: z.string().max(512).optional(),
  place_snapshot: SnapshotSchema.optional(),
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

  const intake: Record<string, unknown> = {};
  if (parsed.data.place_snapshot) {
    intake.place = parsed.data.place_snapshot;
  }
  if (parsed.data.google_place_id) {
    intake.google_place_id = parsed.data.google_place_id;
  }

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
      ...(Object.keys(intake).length ? { intake: intake as Record<string, unknown> } : {}),
    };

  const insert = await supabase.from("leads").insert(insertPayload).select("id").single();

  if (insert.error) {
    console.error(insert.error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500, headers: cors });
  }

  const leadId = insert.data.id as string;
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;

  const addr = parsed.data.place_snapshot?.formatted_address
    ? `\n📍 ${parsed.data.place_snapshot.formatted_address}`
    : "";

  await Promise.allSettled([
    sendLeadConfirmation({
      to: parsed.data.email,
      firstName,
      businessName: parsed.data.businessName,
    }),
    sendKickoffSms(phone, firstName),
    slackNewLead(
      `🚨 NEW LEAD: ${parsed.data.fullName} — ${parsed.data.businessName} (${parsed.data.industry}). Call within 1–2 hrs. Phone: ${phone} · Email: ${parsed.data.email} · Lead ID \`${leadId}\`${addr}`
    ),
    sendMetaLeadEvent({
      leadId,
      email: parsed.data.email,
      phone,
      eventSourceUrl: `${origin}/onboarding`,
    }),
  ]);

  return NextResponse.json({ ok: true, leadId }, { headers: cors });
}
