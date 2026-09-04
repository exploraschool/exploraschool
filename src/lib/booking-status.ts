import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { bookingOfferFingerprint, hasBookingOfferFingerprint } from "@/lib/booking-fingerprint";
import {
  sendCustomerBookingCancellation,
  sendCustomerBookingConfirmation,
} from "@/lib/lead-emails";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { LeadStatus } from "@/lib/leads";

async function deleteDuplicatePendingBookings(
  db: Firestore,
  keepLeadId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const fingerprint = bookingOfferFingerprint(data);
  if (!hasBookingOfferFingerprint(fingerprint)) return;

  const snapshot = await db.collection("leads").where("status", "==", "pending").get();
  const duplicates = snapshot.docs.filter((doc) => {
    if (doc.id === keepLeadId) return false;
    return bookingOfferFingerprint(doc.data()) === fingerprint;
  });
  if (duplicates.length === 0) return;

  const batch = db.batch();
  for (const doc of duplicates) {
    batch.delete(doc.ref);
  }
  await batch.commit();
}

export type BookingStatusUpdateResult =
  | { ok: false; error: string; status: number }
  | {
      ok: true;
      already: boolean;
      data: Record<string, unknown>;
      emailSent: boolean;
      emailError?: string;
    };

export async function updateBookingLeadStatus(
  leadId: string,
  status: Extract<LeadStatus, "confirmed" | "cancelled">,
): Promise<BookingStatusUpdateResult> {
  if (!isAdminConfigured()) {
    return { ok: false, error: "Firebase not configured", status: 503 };
  }

  const db = getAdminDb();
  if (!db) {
    return { ok: false, error: "Database unavailable", status: 503 };
  }

  const ref = db.collection("leads").doc(leadId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return { ok: false, error: "Lead not found", status: 404 };
  }

  const leadData = snapshot.data() ?? {};
  const currentStatus = String(leadData.status ?? "");
  const alreadyConfirmed = currentStatus === "confirmed";
  const alreadyCancelled = currentStatus === "cancelled";
  const confirmationAlreadySent = Boolean(leadData.confirmationEmailSentAt);
  const cancellationAlreadySent = Boolean(leadData.cancellationEmailSentAt);

  if (status === "cancelled") {
    if (alreadyCancelled) {
      try {
        await deleteDuplicatePendingBookings(db, leadId, leadData);
      } catch (duplicateError) {
        console.error("[bookings] Duplicate cleanup failed:", duplicateError);
      }
      return {
        ok: true,
        already: true,
        data: leadData,
        emailSent: cancellationAlreadySent,
      };
    }

    let emailSent = cancellationAlreadySent;
    let emailError: string | undefined;
    const payload = { ...leadData, status: "cancelled" as const };

    if (!cancellationAlreadySent) {
      try {
        await sendCustomerBookingCancellation(payload);
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Email send failed";
        console.error("[bookings] Customer cancellation email failed:", emailError);
      }
    }

    await ref.update({
      status: "cancelled",
      cancelledAt: leadData.cancelledAt ?? new Date().toISOString(),
      confirmedAt: FieldValue.delete(),
      ...(emailSent ? { cancellationEmailSentAt: new Date().toISOString() } : {}),
    });

    try {
      await deleteDuplicatePendingBookings(db, leadId, leadData);
    } catch (duplicateError) {
      console.error("[bookings] Duplicate cleanup failed:", duplicateError);
    }

    return {
      ok: true,
      already: false,
      data: payload,
      emailSent,
      emailError,
    };
  }

  if (alreadyConfirmed && confirmationAlreadySent) {
    try {
      await deleteDuplicatePendingBookings(db, leadId, leadData);
    } catch (duplicateError) {
      console.error("[bookings] Duplicate cleanup failed:", duplicateError);
    }
    return {
      ok: true,
      already: true,
      data: leadData,
      emailSent: true,
    };
  }

  let emailSent = confirmationAlreadySent;
  let emailError: string | undefined;
  const payload = { ...leadData, status: "confirmed" as const };

  if (!confirmationAlreadySent) {
    try {
      await sendCustomerBookingConfirmation(payload);
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Email send failed";
      console.error("[bookings/confirm] Customer email failed:", emailError);
    }
  }

  if (!alreadyConfirmed || (emailSent && !confirmationAlreadySent)) {
    await ref.update({
      status: "confirmed",
      confirmedAt: leadData.confirmedAt ?? new Date().toISOString(),
      cancelledAt: FieldValue.delete(),
      ...(emailSent ? { confirmationEmailSentAt: new Date().toISOString() } : {}),
    });
  }

  try {
    await deleteDuplicatePendingBookings(db, leadId, leadData);
  } catch (duplicateError) {
    console.error("[bookings] Duplicate cleanup failed:", duplicateError);
  }

  return {
    ok: true,
    already: alreadyConfirmed && confirmationAlreadySent,
    data: payload,
    emailSent,
    emailError,
  };
}
