import { Resend } from "resend";

export async function sendLeadConfirmation(opts: {
  to: string;
  firstName: string;
  businessName: string;
}): Promise<{ id?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY missing — skipping email");
    return {};
  }
  const from =
    process.env.RESEND_FROM_EMAIL || "Foxes.ai <onboarding@resend.dev>";
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: `${opts.firstName}, we got your request — here's what happens next`,
    html: `
      <div style="font-family:Georgia,serif;color:#0A0A0A;line-height:1.6;">
        <p>Hi ${escapeHtml(opts.firstName)},</p>
        <p>Thanks for raising your hand for <strong>${escapeHtml(opts.businessName)}</strong>.</p>
        <p>Someone from Patrizio&apos;s team will reach out within <strong>1–2 hours</strong> for a quick 5-minute kickoff call (regular phone — no Zoom needed).</p>
        <p>Have your services, ideal customer, competitors you like (or dislike), and any logo/color notes handy.</p>
        <p>— Foxes.ai</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
