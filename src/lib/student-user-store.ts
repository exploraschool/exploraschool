import { FieldValue } from "firebase-admin/firestore";
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
  return parseStudentProfile(uid, snap.data() as Record<string, unknown>);
}

export async function upsertStudentProfile(
  uid: string,
  patch: Partial<StudentProfile> & { email: string },
): Promise<StudentProfile> {
  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");

  const ref = db.collection(USERS_COLLECTION).doc(uid);
  const existing = await ref.get();
  const now = new Date().toISOString();
  const current = existing.exists
    ? parseStudentProfile(uid, existing.data() as Record<string, unknown>)
    : null;

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

  await ref.set(
    {
      ...next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}
