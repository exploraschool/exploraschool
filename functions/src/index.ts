import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";
import {
  buildCustomerConfirmationEmail,
  buildTeamNotificationEmail,
  createLeadCancelToken,
  createLeadConfirmToken,
  sendResendEmail,
} from "./email.js";

const resendApiKeyParam = defineSecret("RESEND_API_KEY");
const leadConfirmSecretParam = defineSecret("LEAD_CONFIRM_SECRET");
const notificationEmailParam = defineString("LEAD_NOTIFICATION_EMAIL", {
  default: "explora.sclub@gmail.com",
});
const resendFromParam = defineString("RESEND_FROM", {
  default: "Explora School <onboarding@resend.dev>",
});
const siteUrlParam = defineString("SITE_URL", {
  default: "https://www.explora-school.es",
});

export const onLeadCreated = onDocumentCreated(
  {
    document: "leads/{leadId}",
    region: "europe-west1",
    secrets: [resendApiKeyParam, leadConfirmSecretParam],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("Lead created event without snapshot");
      return;
    }

    const leadId = event.params.leadId;
    const data = { ...snapshot.data() };
    const apiKey = resendApiKeyParam.value();
    const siteUrl = siteUrlParam.value().replace(/\/$/, "");
    const confirmSecret = leadConfirmSecretParam.value();
    const to = notificationEmailParam.value();
    const from = resendFromParam.value();

    const isBooking = data.type === "booking" || data.source === "booking-cart";
    if (isBooking && confirmSecret) {
      const confirmToken =
        typeof data.confirmToken === "string" && data.confirmToken.trim()
          ? data.confirmToken.trim()
          : createLeadConfirmToken(leadId, confirmSecret);
      const cancelToken =
        typeof data.cancelToken === "string" && data.cancelToken.trim()
          ? data.cancelToken.trim()
          : createLeadCancelToken(leadId, confirmSecret);

      if (data.confirmToken !== confirmToken || data.cancelToken !== cancelToken) {
        await snapshot.ref.update({ confirmToken, cancelToken });
      }
      data.confirmToken = confirmToken;
      data.cancelToken = cancelToken;
    }

    const { subject, text, html } = buildTeamNotificationEmail({
      leadId,
      data,
      siteUrl,
      confirmSecret,
    });

    try {
      await sendResendEmail(apiKey, { from, to: [to], subject, text, html });
      logger.info("Team notification sent", { leadId, to });
    } catch (error) {
      logger.error("Failed to send team notification", { leadId, error });
      throw error;
    }
  },
);

export const onLeadUpdated = onDocumentUpdated(
  {
    document: "leads/{leadId}",
    region: "europe-west1",
    secrets: [resendApiKeyParam],
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const previousStatus = String(before.status ?? "");
    const nextStatus = String(after.status ?? "");
    if (previousStatus === nextStatus || nextStatus !== "confirmed") return;

    const isBooking = after.type === "booking" || after.source === "booking-cart";
    if (!isBooking) return;

    if (after.confirmationEmailSentAt) {
      logger.info("Customer confirmation already sent from API", {
        leadId: event.params.leadId,
      });
      return;
    }

    const customerEmail = String(after.email ?? "");
    if (!customerEmail) {
      logger.warn("Confirmed booking without customer email", { leadId: event.params.leadId });
      return;
    }

    const apiKey = resendApiKeyParam.value();
    const from = resendFromParam.value();
    const siteUrl = siteUrlParam.value().replace(/\/$/, "");
    const { subject, text, html } = buildCustomerConfirmationEmail({
      data: after,
      siteUrl,
    });

    try {
      await sendResendEmail(apiKey, {
        from,
        to: [customerEmail],
        subject,
        text,
        html,
      });
      await event.data?.after.ref.update({
        confirmationEmailSentAt: new Date().toISOString(),
      });
      logger.info("Customer confirmation sent", {
        leadId: event.params.leadId,
        to: customerEmail,
      });
    } catch (error) {
      logger.error("Failed to send customer confirmation", {
        leadId: event.params.leadId,
        error,
      });
      throw error;
    }
  },
);
