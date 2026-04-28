import twilio from "twilio";

export async function sendKickoffSms(toE164: string, firstName: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("Twilio env missing — skipping SMS");
    return;
  }
  const client = twilio(sid, token);
  await client.messages.create({
    body: `Got it ${firstName}! We'll call you within 1-2 hours for a quick kickoff. Have services, ideal customer & any sites you like handy. — Foxes.ai`,
    from,
    to: toE164,
  });
}
