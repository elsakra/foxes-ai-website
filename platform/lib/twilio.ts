import twilio from "twilio";
import { isValidUsMobileE164 } from "@/lib/phone";

export async function sendKickoffSms(toE164: string, firstName: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[twilio] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER missing — SMS skipped");
    return;
  }
  const to = toE164.replace(/\s/g, "");
  if (!isValidUsMobileE164(to)) {
    console.warn("[twilio] phone not valid US E.164 (+1…) — SMS skipped:", to);
    return;
  }
  const hi = firstName.trim() ? firstName.trim() : "there";
  const client = twilio(sid, token);
  try {
    const msg = await client.messages.create({
      body:
        `${hi}, you're set! Confirmation email went to your inbox too. Expect a call within 5 minutes to kick off your site plan. — Foxes.ai`,
      from,
      to,
    });
    console.log("[twilio] kickoff SMS sent", { sid: msg.sid, to: msg.to });
  } catch (err) {
    console.error("[twilio] kickoff SMS failed", err);
    throw err;
  }
}
