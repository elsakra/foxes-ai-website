import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeUsPhone } from "@/lib/phone";
import { sendLeadConfirmation } from "@/lib/resend";
import { sendKickoffSms } from "@/lib/twilio";
import { slackNewLead } from "@/lib/slack";
import { sendMetaLeadEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

function funnelCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = (process.env.FUNNEL_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
});

export function OPTIONS(req: Request) {
  const h = funnelCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: h });
}

export async function POST(req: Request) {
  const cors = funnelCorsHeaders(req);
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

  const supabase = createServiceRoleClient();
  const insert = await supabase
    .from("leads")
    .insert({
      business_name: parsed.data.businessName.trim(),
      industry: parsed.data.industry.trim(),
      full_name: parsed.data.fullName.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      phone,
      utm_source: parsed.data.utm_source ?? null,
      utm_medium: parsed.data.utm_medium ?? null,
      utm_campaign: parsed.data.utm_campaign ?? null,
      utm_content: parsed.data.utm_content ?? null,
    })
    .select("id")
    .single();

  if (insert.error) {
    console.error(insert.error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500, headers: cors });
  }

  const leadId = insert.data.id as string;
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;

  await Promise.allSettled([
    sendLeadConfirmation({
      to: parsed.data.email,
      firstName,
      businessName: parsed.data.businessName,
    }),
    sendKickoffSms(phone, firstName),
    slackNewLead(
      `🚨 NEW LEAD: ${parsed.data.fullName} — ${parsed.data.businessName} (${parsed.data.industry}). Call within 1–2 hrs. Phone: ${phone} · Email: ${parsed.data.email} · Lead ID \`${leadId}\``
    ),
    sendMetaLeadEvent({
      leadId,
      email: parsed.data.email,
      phone,
      eventSourceUrl: `${origin}/free-website`,
    }),
  ]);

  return NextResponse.json({ ok: true, leadId }, { headers: cors });
}
