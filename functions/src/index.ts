import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";
import {
  buildCustomerConfirmationEmail,
  buildTeamNotificationEmail,
  createLeadCancelToken,
  createLeadConfirmToken,
  sendResendEmail,
} from "./email.js";
import {
  buildStudentProfileReminderEmail,
  buildTeamProfileReminderEmail,
} from "./profile-reminder-emails.js";

if (!getApps().length) {
  initializeApp();
}

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

const HOUR_MS = 60 * 60 * 1000;
/** Team alert ~1 day after booking (1 day before student reminder). */
const TEAM_REMINDER_AFTER_MS = 24 * HOUR_MS;
/** Student reminder ~2 days after booking. */
const STUDENT_REMINDER_AFTER_MS = 48 * HOUR_MS;
/** Hourly window half-width so each lead is eligible in one cron tick. */
const WINDOW_HALF_MS = 45 * 60 * 1000;

function isBookingLead(data: Record<string, unknown>): boolean {
  return data.type === "booking" || data.source === "booking-cart";
}

type FichaStatus = {
  incomplete: boolean;
  reason: string;
  studentUid: string | null;
};

async function resolveFichaStatus(
  data: Record<string, unknown>,
): Promise<FichaStatus> {
  const db = getFirestore();
  const email = String(data.email ?? "").trim();
  const emailLower = String(data.emailLower ?? email).trim().toLowerCase();
  let uid =
    typeof data.studentUid === "string" && data.studentUid.trim()
      ? data.studentUid.trim()
      : null;

  if (!uid && emailLower) {
    try {
      const byEmail = await db.collection("users").where("email", "==", email).limit(5).get();
      for (const doc of byEmail.docs) {
        const row = doc.data();
        if (String(row.email ?? "").trim().toLowerCase() === emailLower) {
          uid = doc.id;
          break;
        }
      }
    } catch (error) {
      logger.warn("User lookup by email failed", { emailLower, error });
    }
  }

  if (!uid) {
    return {
      incomplete: true,
      reason: "Sin cuenta Explora vinculada",
      studentUid: null,
    };
  }

  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) {
    return {
      incomplete: true,
      reason: "Cuenta marcada en la reserva pero el perfil no existe",
      studentUid: uid,
    };
  }

  const profile = snap.data() ?? {};
  const onboardingCompletedAt =
    typeof profile.onboardingCompletedAt === "string" ? profile.onboardingCompletedAt : null;
  const disciplines = Array.isArray(profile.disciplines) ? profile.disciplines : [];
  const selfLevel = profile.selfLevel ?? null;
  const equipment = profile.equipment;

  if (!onboardingCompletedAt) {
    return {
      incomplete: true,
      reason: "Onboarding de ficha no completado",
      studentUid: uid,
    };
  }
  if (!selfLevel || disciplines.length === 0) {
    return {
      incomplete: true,
      reason: "Ficha sin nivel o disciplinas",
      studentUid: uid,
    };
  }
  if (!equipment || typeof equipment !== "object") {
    return {
      incomplete: true,
      reason: "Ficha sin datos de material",
      studentUid: uid,
    };
  }

  return { incomplete: false, reason: "", studentUid: uid };
}

function windowBounds(centerMs: number, nowMs: number): { startIso: string; endIso: string } {
  const start = new Date(nowMs - centerMs - WINDOW_HALF_MS).toISOString();
  const end = new Date(nowMs - centerMs + WINDOW_HALF_MS).toISOString();
  return { startIso: start, endIso: end };
}

async function loadBookingLeadsInWindow(startIso: string, endIso: string) {
  const db = getFirestore();
  const snap = await db
    .collection("leads")
    .where("type", "==", "booking")
    .where("createdAt", ">=", startIso)
    .where("createdAt", "<=", endIso)
    .get();
  return snap.docs;
}

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

    const isBooking = isBookingLead(data);
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

    const isBooking = isBookingLead(after);
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

/**
 * Hourly: team reminder at ~+1 day, student reminder at ~+2 days,
 * only if the student ficha/profile is still incomplete.
 */
export const sendProfileReminders = onSchedule(
  {
    schedule: "every 1 hours",
    timeZone: "Europe/Madrid",
    region: "europe-west1",
    secrets: [resendApiKeyParam],
  },
  async () => {
    const apiKey = resendApiKeyParam.value();
    const from = resendFromParam.value();
    const teamTo = notificationEmailParam.value();
    const siteUrl = siteUrlParam.value().replace(/\/$/, "");
    const nowMs = Date.now();

    const teamWindow = windowBounds(TEAM_REMINDER_AFTER_MS, nowMs);
    const studentWindow = windowBounds(STUDENT_REMINDER_AFTER_MS, nowMs);

    const [teamDocs, studentDocs] = await Promise.all([
      loadBookingLeadsInWindow(teamWindow.startIso, teamWindow.endIso),
      loadBookingLeadsInWindow(studentWindow.startIso, studentWindow.endIso),
    ]);

    logger.info("Profile reminder sweep", {
      teamCandidates: teamDocs.length,
      studentCandidates: studentDocs.length,
      teamWindow,
      studentWindow,
    });

    for (const doc of teamDocs) {
      const data = doc.data() as Record<string, unknown>;
      if (!isBookingLead(data)) continue;
      if (String(data.status ?? "") === "cancelled") continue;
      if (data.profileReminderTeamSentAt) continue;

      const ficha = await resolveFichaStatus(data);
      if (!ficha.incomplete) {
        await doc.ref.update({
          profileReminderTeamSkippedAt: new Date().toISOString(),
          profileReminderTeamSkipReason: "ficha_completa",
        });
        continue;
      }

      const items = Array.isArray(data.bookingItems)
        ? (data.bookingItems as Array<Record<string, unknown>>)
        : [];
      const ctx = {
        leadId: doc.id,
        name: String(data.name ?? ""),
        email: String(data.email ?? ""),
        phone: String(data.phone ?? ""),
        locale: String(data.locale ?? "es"),
        studentUid: ficha.studentUid,
        reason: ficha.reason,
        bookingItems: items.map((item) => ({
          productId: typeof item.productId === "string" ? item.productId : undefined,
          date: typeof item.date === "string" ? item.date : undefined,
          timeSlotLabel: typeof item.timeSlotLabel === "string" ? item.timeSlotLabel : undefined,
          discipline: typeof item.discipline === "string" ? item.discipline : undefined,
        })),
        siteUrl,
      };

      if (!ctx.email) {
        logger.warn("Team profile reminder skipped: no email", { leadId: doc.id });
        continue;
      }

      try {
        const { subject, text, html } = buildTeamProfileReminderEmail(ctx);
        await sendResendEmail(apiKey, { from, to: [teamTo], subject, text, html });
        await doc.ref.update({
          profileReminderTeamSentAt: new Date().toISOString(),
          profileReminderTeamReason: ficha.reason,
        });
        logger.info("Team profile reminder sent", { leadId: doc.id, to: teamTo });
      } catch (error) {
        logger.error("Team profile reminder failed", { leadId: doc.id, error });
      }
    }

    for (const doc of studentDocs) {
      const data = doc.data() as Record<string, unknown>;
      if (!isBookingLead(data)) continue;
      if (String(data.status ?? "") === "cancelled") continue;
      if (data.profileReminderStudentSentAt) continue;

      const ficha = await resolveFichaStatus(data);
      if (!ficha.incomplete) {
        await doc.ref.update({
          profileReminderStudentSkippedAt: new Date().toISOString(),
          profileReminderStudentSkipReason: "ficha_completa",
        });
        continue;
      }

      const customerEmail = String(data.email ?? "").trim();
      if (!customerEmail) {
        logger.warn("Student profile reminder skipped: no email", { leadId: doc.id });
        continue;
      }

      const items = Array.isArray(data.bookingItems)
        ? (data.bookingItems as Array<Record<string, unknown>>)
        : [];
      const ctx = {
        leadId: doc.id,
        name: String(data.name ?? ""),
        email: customerEmail,
        phone: String(data.phone ?? ""),
        locale: String(data.locale ?? "es"),
        studentUid: ficha.studentUid,
        reason: ficha.reason,
        bookingItems: items.map((item) => ({
          productId: typeof item.productId === "string" ? item.productId : undefined,
          date: typeof item.date === "string" ? item.date : undefined,
          timeSlotLabel: typeof item.timeSlotLabel === "string" ? item.timeSlotLabel : undefined,
          discipline: typeof item.discipline === "string" ? item.discipline : undefined,
        })),
        siteUrl,
      };

      try {
        const { subject, text, html } = buildStudentProfileReminderEmail(ctx);
        await sendResendEmail(apiKey, { from, to: [customerEmail], subject, text, html });
        await doc.ref.update({
          profileReminderStudentSentAt: new Date().toISOString(),
          profileReminderStudentReason: ficha.reason,
        });
        logger.info("Student profile reminder sent", { leadId: doc.id, to: customerEmail });
      } catch (error) {
        logger.error("Student profile reminder failed", { leadId: doc.id, error });
      }
    }
  },
);
