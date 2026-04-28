/** Server-side Meta Conversions API Lead event — optional */
export async function sendMetaLeadEvent(payload: {
  leadId: string;
  email?: string;
  phone?: string;
  eventSourceUrl?: string;
}): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;
  const hashedEmail = payload.email ? await sha256normalize(payload.email) : undefined;
  const hashedPhone = payload.phone ? await sha256normalize(payload.phone) : undefined;

  const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `lead_${payload.leadId}`,
          action_source: "website",
          event_source_url: payload.eventSourceUrl || "https://foxes.ai/free-website",
          user_data: {
            ...(hashedEmail ? { em: [hashedEmail] } : {}),
            ...(hashedPhone ? { ph: [hashedPhone] } : {}),
          },
        },
      ],
      access_token: token,
    }),
  });
  if (!res.ok) {
    console.warn("Meta CAPI error", await res.text());
  }
}

async function sha256normalize(s: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
