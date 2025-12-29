import { Resend } from "resend";

const ADMIN_EMAIL = "nasir231111@gmail.com";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

type EmailPayload = {
  to: string[];
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!resend) return { ok: false, error: "Email not configured" };
  const to = payload.to.filter(Boolean);
  if (!to.length) return { ok: false, error: "No recipients" };
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: payload.subject,
      html: payload.html,
    });
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error?.message || "Email failed" };
  }
}

export function adminRecipients(extra?: string | null) {
  const recipients = [ADMIN_EMAIL];
  if (extra) recipients.push(extra);
  return recipients;
}

export function userRecipients(email?: string | null) {
  return email ? [email] : [];
}
