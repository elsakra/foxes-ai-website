import { NextResponse } from "next/server";
import { z } from "zod";
import { slackNewLead } from "@/lib/slack";
import { sendMetaLeadEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

const DEFAULT_PREVIEW_ORIGINS = [
  "https://foxes.ai",
  "https://www.foxes.ai",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

function allowedPreviewOrigins(): string[] {
  const raw =
    process.env.PREVIEW_ALLOWED_ORIGINS ??
    process.env.ONBOARDING_ALLOWED_ORIGINS ??
    process.env.FUNNEL_ALLOWED_ORIGINS ??
    "";
  const fromEnv = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set([...fromEnv, ...DEFAULT_PREVIEW_ORIGINS])];
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (origin && allowedPreviewOrigins().includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return {};
}

const PreviewInterestSchema = z.object({
  email: z.string().email(),
  /** Honeypot — must be empty */
  website: z.string().optional(),
  eventId: z.string().min(8).max(120).optional(),
  pageUrl: z.string().max(1000).optional(),
  pagePath: z.string().max(300).optional(),
  referrer: z.string().max(1000).optional(),
  utm_source: z.string().max(300).optional(),
  utm_medium: z.string().max(300).optional(),
  utm_campaign: z.string().max(300).optional(),
  utm_content: z.string().max(300).optional(),
  utm_term: z.string().max(300).optional(),
  fbclid: z.string().max(500).optional(),
  gclid: z.string().max(500).optional(),
});

export function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers });
  }

  const parsed = PreviewInterestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400, headers });
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const previewLeadId = crypto.randomUUID();
  const eventId = parsed.data.eventId || `preview_email_${previewLeadId}`;

  await Promise.all([
    slackNewLead(`🦊 PREVIEW EMAIL CAPTURE: ${email} · Preview ID \`${previewLeadId}\``).catch((e) => {
      console.error("[preview-interest] slack notify failed", e);
    }),
    sendMetaLeadEvent({
      leadId: previewLeadId,
      email,
      eventName: "PreviewEmailLead",
      eventId,
      eventSourceUrl: "https://foxes.ai/preview.html",
    }).catch((e) => {
      console.error("[preview-interest] Meta CAPI failed", e);
    }),
  ]);

  return NextResponse.json({ ok: true, previewLeadId, eventId }, { headers });
}
