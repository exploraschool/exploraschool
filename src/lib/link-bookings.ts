import type { Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { isBookingLead, type StoredLead } from "@/lib/leads";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function linkBookingLeadsToStudent(
  db: Firestore,
  params: { uid: string; email: string },
): Promise<{ linked: number; leadIds: string[] }> {
  const emailLower = normalizeEmail(params.email);
  if (!emailLower) return { linked: 0, leadIds: [] };

  const bookings = db.collection("leads").where("type", "==", "booking");
  const [byLower, byExact] = await Promise.all([
    bookings.where("emailLower", "==", emailLower).get().catch(() => null),
    bookings.where("email", "==", params.email.trim()).get().catch(() => null),
  ]);

  const docs = new Map<string, QueryDocumentSnapshot>();
  for (const snap of [byLower, byExact]) {
    if (!snap) continue;
    for (const doc of snap.docs) docs.set(doc.id, doc);
  }

  if (docs.size === 0) {
    const all = await bookings.get();
    for (const doc of all.docs) {
      const data = doc.data() as Partial<StoredLead>;
      if (!isBookingLead(data)) continue;
      if (normalizeEmail(data.email ?? "") === emailLower) docs.set(doc.id, doc);
    }
  }

  const leadIds: string[] = [];
  const batch = db.batch();
  let writes = 0;
  for (const doc of docs.values()) {
    const data = doc.data() as Partial<StoredLead> & { studentUid?: string; emailLower?: string };
    const updates: Record<string, unknown> = {};
    if (data.studentUid !== params.uid) updates.studentUid = params.uid;
    if (data.emailLower !== emailLower) updates.emailLower = emailLower;
    if (Object.keys(updates).length === 0) {
      leadIds.push(doc.id);
      continue;
    }
    updates.updatedAt = FieldValue.serverTimestamp();
    batch.update(doc.ref, updates);
    leadIds.push(doc.id);
    writes += 1;
  }

  if (writes) await batch.commit();
  return { linked: leadIds.length, leadIds };
}

export async function listStudentBookingLeads(
  db: Firestore,
  params: { uid: string; email: string },
): Promise<Array<{ id: string; data: StoredLead }>> {
  const emailLower = normalizeEmail(params.email);
  const bookings = db.collection("leads").where("type", "==", "booking");

  const [byUid, byLower] = await Promise.all([
    bookings.where("studentUid", "==", params.uid).get().catch(() => null),
    bookings.where("emailLower", "==", emailLower).get().catch(() => null),
  ]);

  const map = new Map<string, StoredLead>();
  for (const snap of [byUid, byLower]) {
    if (!snap) continue;
    for (const doc of snap.docs) {
      map.set(doc.id, { ...(doc.data() as StoredLead) });
    }
  }

  if (map.size === 0) {
    const all = await bookings.get();
    for (const doc of all.docs) {
      const data = doc.data() as StoredLead;
      if (normalizeEmail(data.email ?? "") === emailLower || data.studentUid === params.uid) {
        map.set(doc.id, data);
      }
    }
  }

  return [...map.entries()]
    .map(([id, data]) => ({ id, data }))
    .sort((a, b) => String(b.data.createdAt).localeCompare(String(a.data.createdAt)));
}
