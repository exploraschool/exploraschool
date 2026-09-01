import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";

initializeApp();

const resendApiKeyParam = defineString("RESEND_API_KEY", { default: "" });
const notificationEmailParam = defineString("LEAD_NOTIFICATION_EMAIL", {
  default: "explora.sclub@gmail.com",
});
const resendFromParam = defineString("RESEND_FROM", {
  default: "Explora School <onboarding@resend.dev>",
});

const LEAD_FIELDS = [
  "name",
  "email",
  "phone",
  "message",
  "locale",
  "productId",
  "discipline",
  "participants",
  "preferredDates",
  "source",
] as const;

function formatLeadBody(
  leadId: string,
  data: Record<string, unknown>,
): { text: string; html: string } {
  const lines = [`Nuevo lead (${leadId})`, ""];

  for (const key of LEAD_FIELDS) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`${key}: ${String(value)}`);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (
      (LEAD_FIELDS as readonly string[]).includes(key) ||
      key === "createdAt"
    ) {
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`${key}: ${String(value)}`);
    }
  }

  const text = lines.join("\n");
  const html = lines
    .map((line) => (line === "" ? "<br>" : `<p>${escapeHtml(line)}</p>`))
    .join("\n");

  return { text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendLeadEmail(
  apiKey: string,
  to: string,
  from: string,
  leadId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const subject = `[Explora School] Nuevo lead — ${data.name ?? leadId}`;
  const { text, html } = formatLeadBody(leadId, data);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API ${response.status}: ${body}`);
  }
}

export const onLeadCreated = onDocumentCreated(
  {
    document: "leads/{leadId}",
    region: "europe-west1",
  },
  async (event) => {
    const apiKey = process.env.RESEND_API_KEY || resendApiKeyParam.value();
    if (!apiKey) {
      logger.info("RESEND_API_KEY not set — skipping lead notification email");
      return;
    }

    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("Lead created event without snapshot");
      return;
    }

    const leadId = event.params.leadId;
    const data = snapshot.data();
    const to = notificationEmailParam.value();
    const from = resendFromParam.value();

    try {
      await sendLeadEmail(apiKey, to, from, leadId, data);
      logger.info("Lead notification sent", { leadId, to });
    } catch (error) {
      logger.error("Failed to send lead notification", { leadId, error });
      throw error;
    }
  },
);
