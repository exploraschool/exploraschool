import { buildCustomerConfirmationEmail } from "@/lib/customer-confirmation-email";
import { createLeadConfirmToken } from "@/lib/lead-confirm";
import { buildTeamNotificationEmail } from "@/lib/team-notification-email";

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};

export async function sendResendEmail(email: ResendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API ${response.status}: ${body}`);
  }
}

export { createLeadConfirmToken };

function getEmailConfig() {
  return {
    from: process.env.RESEND_FROM ?? "Explora School <onboarding@resend.dev>",
    teamTo: process.env.LEAD_NOTIFICATION_EMAIL ?? "explora.sclub@gmail.com",
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.explora-school.es").replace(/\/$/, ""),
    confirmSecret: process.env.LEAD_CONFIRM_SECRET,
  };
}

export async function sendTeamLeadNotification(
  leadId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const { from, teamTo, siteUrl, confirmSecret } = getEmailConfig();
  const { subject, text, html } = buildTeamNotificationEmail({
    leadId,
    data,
    siteUrl,
    confirmSecret,
  });
  await sendResendEmail({ from, to: [teamTo], subject, text, html });
}

export async function sendCustomerBookingConfirmation(data: Record<string, unknown>): Promise<void> {
  const { from, siteUrl } = getEmailConfig();
  const customerEmail = String(data.email ?? "");
  if (!customerEmail) return;

  const { subject, text, html } = buildCustomerConfirmationEmail({ data, siteUrl });
  await sendResendEmail({ from, to: [customerEmail], subject, text, html });
}
