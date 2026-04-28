import { Resend } from "resend";

export async function sendLeadConfirmation(opts: {
  to: string;
  firstName: string;
  businessName: string;
}): Promise<{ id?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[resend] RESEND_API_KEY missing — skipping email");
    return {};
  }
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Foxes.ai <noreply@alerts.intentsignal.ai>";
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: `${opts.firstName}, we got your request — here's what happens next`,
    html: `
      <div style="font-family:Georgia,serif;color:#0A0A0A;line-height:1.6;">
        <p>Hi ${escapeHtml(opts.firstName)},</p>
        <p>Thanks for raising your hand for <strong>${escapeHtml(opts.businessName)}</strong>.</p>
        <p>This message is sent automatically when you submit the form—<strong>whether or not you added an optional website URL</strong>. You should also receive a <strong>confirmation SMS</strong> to the mobile number you gave us.</p>
        <p>Someone from Patrizio&apos;s team will call you within about <strong>5 minutes</strong> to kick things off on the phone.</p>
        <p>If you grabbed a rundown video on the confirmation page, watch while you&apos;re queued up—stay near your phone.</p>
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
