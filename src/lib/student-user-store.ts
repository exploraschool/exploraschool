import { FieldValue } from "firebase-admin/firestore";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  parseStudentProfile,
  USERS_COLLECTION,
  type StudentProfile,
} from "@/lib/student-users";

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
    selfLevel: patch.selfLevel !== undefined ? patch.selfLevel : (current?.selfLevel ?? null),
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
