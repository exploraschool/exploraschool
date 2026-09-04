import { FieldValue } from "firebase-admin/firestore";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  parseStudentProfile,
  USERS_COLLECTION,
  type StudentProfile,
} from "@/lib/student-users";
import { PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  const profile = parseStudentProfile(uid, snap.data() as Record<string, unknown>);
  if (isAllowedAdminEmail(profile.email)) return null;
  return profile;
}

export async function upsertStudentProfile(
  uid: string,
  patch: Partial<StudentProfile> & { email: string },
): Promise<StudentProfile> {
  if (isAllowedAdminEmail(patch.email)) {
    throw new Error("staff_email_not_student");
  }

  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");

  const ref = db.collection(USERS_COLLECTION).doc(uid);
  const existing = await ref.get();
  const now = new Date().toISOString();
  const current = existing.exists
    ? parseStudentProfile(uid, existing.data() as Record<string, unknown>)
    : null;

  if (current && isAllowedAdminEmail(current.email)) {
    throw new Error("staff_email_not_student");
  }

  const next: StudentProfile = {
    uid,
    email: patch.email || current?.email || "",
    displayName: patch.displayName ?? current?.displayName ?? "",
    photoURL: patch.photoURL ?? current?.photoURL ?? "",
    locale: patch.locale ?? current?.locale ?? "es",
    hasTakenClassesBefore:
      patch.hasTakenClassesBefore !== undefined
        ? patch.hasTakenClassesBefore
        : (current?.hasTakenClassesBefore ?? null),
    onboardingCompletedAt:
      patch.onboardingCompletedAt !== undefined
        ? patch.onboardingCompletedAt
        : (current?.onboardingCompletedAt ?? null),
    disciplines: patch.disciplines ?? current?.disciplines ?? [],
    equipment: patch.equipment !== undefined ? patch.equipment : (current?.equipment ?? null),
    companions: patch.companions ?? current?.companions ?? [],
    selfSkills: patch.selfSkills !== undefined ? patch.selfSkills : (current?.selfSkills ?? {}),
    selfLevel: patch.selfLevel !== undefined ? patch.selfLevel : (current?.selfLevel ?? null),
    staffTips: patch.staffTips !== undefined ? patch.staffTips : (current?.staffTips ?? ""),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  if (isAllowedAdminEmail(next.email)) {
    throw new Error("staff_email_not_student");
  }

  await ref.set(
    {
      ...next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function listStudentProfiles(): Promise<StudentProfile[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snap = await db.collection(USERS_COLLECTION).get();
    return snap.docs
      .map((doc) => parseStudentProfile(doc.id, doc.data() as Record<string, unknown>))
      .filter((profile) => profile.email && !isAllowedAdminEmail(profile.email))
      .sort((a, b) => {
        const nameA = a.displayName || a.email;
        const nameB = b.displayName || b.email;
        return nameA.localeCompare(nameB, "es");
      });
  } catch (error) {
    console.error("[student-user-store] list failed:", error);
    return [];
  }
}

export async function adminUpsertStudentProfile(
  uid: string,
  patch: Partial<StudentProfile>,
): Promise<StudentProfile | null> {
  const current = await getStudentProfile(uid);
  if (!current) return null;
  return upsertStudentProfile(uid, {
    email: current.email,
    ...patch,
  });
}

/**
 * Deletes the student profile and related media/gallery links.
 * Keeps booking leads; clears studentUid so they can re-link after re-registering.
 */
export async function deleteStudentProfile(uid: string): Promise<boolean> {
  const current = await getStudentProfile(uid);
  if (!current) return false;

  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");

  const { deleteAllStudentMediaForUid } = await import("@/lib/student-media");
  await deleteAllStudentMediaForUid(uid);

  try {
    const reportSnap = await db.collection(PROGRESS_REPORTS_COLLECTION).where("studentUid", "==", uid).get();
    const batch = db.batch();
    let ops = 0;
    for (const doc of reportSnap.docs) {
      batch.delete(doc.ref);
      ops += 1;
      if (ops >= 400) {
        await batch.commit();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();
  } catch (error) {
    console.error("[student-user-store] delete progress failed:", error);
  }

  try {
    const leadSnap = await db.collection("leads").where("studentUid", "==", uid).get();
    const batch = db.batch();
    let ops = 0;
    for (const doc of leadSnap.docs) {
      batch.update(doc.ref, { studentUid: FieldValue.delete() });
      ops += 1;
      if (ops >= 400) {
        await batch.commit();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();
  } catch (error) {
    console.error("[student-user-store] unlink leads failed:", error);
  }

  await db.collection(USERS_COLLECTION).doc(uid).delete();
  return true;
}
