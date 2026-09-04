import { FieldValue } from "firebase-admin/firestore";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { getAdminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/student-users";

export const STUDENT_TIPS_SUBCOLLECTION = "tips";

export type StudentTipSource = "staff" | "report" | "correction";

export type StudentTip = {
  id: string;
  text: string;
  createdAt: string;
  authorSlug: string;
  authorName: string;
  discipline?: ProgressDisciplineId;
  source: StudentTipSource;
  pinned: boolean;
};

export function tipsCollectionPath(uid: string): string {
  return `${USERS_COLLECTION}/${uid}/${STUDENT_TIPS_SUBCOLLECTION}`;
}

export function parseStudentTip(id: string, data: Record<string, unknown>): StudentTip {
  return {
    id,
    text: typeof data.text === "string" ? data.text.trim() : "",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    authorSlug: typeof data.authorSlug === "string" ? data.authorSlug : "",
    authorName: typeof data.authorName === "string" ? data.authorName : "",
    discipline:
      typeof data.discipline === "string" ? (data.discipline as ProgressDisciplineId) : undefined,
    source:
      data.source === "report" || data.source === "correction" || data.source === "staff"
        ? data.source
        : "staff",
    pinned: data.pinned === true,
  };
}

export async function listStudentTips(uid: string, limit = 40): Promise<StudentTip[]> {
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db
    .collection(tipsCollectionPath(uid))
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()
    .catch(async () => db.collection(tipsCollectionPath(uid)).get());

  const tips = snap.docs.map((doc) => parseStudentTip(doc.id, doc.data() as Record<string, unknown>));
  tips.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return tips;
}

export async function getPinnedTip(uid: string): Promise<StudentTip | null> {
  const tips = await listStudentTips(uid, 50);
  return tips.find((tip) => tip.pinned) ?? null;
}

/** If profile has staffTips but no tip docs, seed one pinned tip. */
export async function ensureTipsMigratedFromStaffTips(
  uid: string,
  staffTips: string,
): Promise<StudentTip[]> {
  const existing = await listStudentTips(uid, 5);
  if (existing.length > 0) return listStudentTips(uid);
  const text = staffTips.trim();
  if (!text) return [];
  await createStudentTip(uid, {
    text,
    authorSlug: "explora",
    authorName: "Explora",
    source: "staff",
    pinned: true,
  });
  return listStudentTips(uid);
}

export async function createStudentTip(
  uid: string,
  input: {
    text: string;
    authorSlug: string;
    authorName: string;
    source: StudentTipSource;
    pinned?: boolean;
    discipline?: ProgressDisciplineId;
  },
): Promise<StudentTip> {
  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");

  const text = input.text.trim();
  if (!text) throw new Error("empty_tip");

  const ref = db.collection(tipsCollectionPath(uid)).doc();
  const now = new Date().toISOString();
  const tip: StudentTip = {
    id: ref.id,
    text,
    createdAt: now,
    authorSlug: input.authorSlug,
    authorName: input.authorName,
    discipline: input.discipline,
    source: input.source,
    pinned: Boolean(input.pinned),
  };

  if (tip.pinned) {
    await unpinAllTips(uid);
  }

  await ref.set({
    id: tip.id,
    text: tip.text,
    createdAt: tip.createdAt,
    authorSlug: tip.authorSlug,
    authorName: tip.authorName,
    ...(tip.discipline ? { discipline: tip.discipline } : {}),
    source: tip.source,
    pinned: tip.pinned,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (tip.pinned) {
    await syncStaffTipsFromPinned(uid, tip.text);
  }

  return tip;
}

async function unpinAllTips(uid: string): Promise<void> {
  const db = getAdminDb();
  if (!db) return;
  const snap = await db.collection(tipsCollectionPath(uid)).where("pinned", "==", true).get().catch(async () => {
    const all = await db.collection(tipsCollectionPath(uid)).get();
    return { docs: all.docs.filter((doc) => doc.data().pinned === true) };
  });
  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.update(doc.ref, { pinned: false });
  }
  if (snap.docs.length) await batch.commit();
}

export async function syncStaffTipsFromPinned(uid: string, text: string): Promise<void> {
  const db = getAdminDb();
  if (!db) return;
  await db.collection(USERS_COLLECTION).doc(uid).set(
    {
      staffTips: text,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setTipPinned(uid: string, tipId: string, pinned: boolean): Promise<StudentTip | null> {
  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");
  const ref = db.collection(tipsCollectionPath(uid)).doc(tipId);
  const snap = await ref.get();
  if (!snap.exists) return null;

  if (pinned) await unpinAllTips(uid);
  await ref.update({ pinned, updatedAt: FieldValue.serverTimestamp() });

  const tip = parseStudentTip(tipId, { ...(snap.data() as Record<string, unknown>), pinned });
  if (pinned) {
    await syncStaffTipsFromPinned(uid, tip.text);
  } else {
    const remaining = await getPinnedTip(uid);
    await syncStaffTipsFromPinned(uid, remaining?.text ?? "");
  }
  return tip;
}

export async function updateStudentTip(
  uid: string,
  tipId: string,
  patch: { text?: string; pinned?: boolean },
): Promise<StudentTip | null> {
  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");
  const ref = db.collection(tipsCollectionPath(uid)).doc(tipId);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const current = parseStudentTip(tipId, snap.data() as Record<string, unknown>);
  const nextText = patch.text !== undefined ? patch.text.trim() : current.text;
  if (!nextText) throw new Error("empty_tip");

  if (patch.pinned === true) await unpinAllTips(uid);

  const pinned = patch.pinned !== undefined ? patch.pinned : current.pinned;
  await ref.update({
    text: nextText,
    pinned,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const tip: StudentTip = { ...current, text: nextText, pinned };
  if (pinned) await syncStaffTipsFromPinned(uid, nextText);
  else if (patch.pinned === false) {
    const remaining = await getPinnedTip(uid);
    await syncStaffTipsFromPinned(uid, remaining?.text ?? "");
  }
  return tip;
}

export async function deleteStudentTip(uid: string, tipId: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) throw new Error("database_unavailable");
  const ref = db.collection(tipsCollectionPath(uid)).doc(tipId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const wasPinned = snap.data()?.pinned === true;
  await ref.delete();
  if (wasPinned) {
    const remaining = await getPinnedTip(uid);
    await syncStaffTipsFromPinned(uid, remaining?.text ?? "");
  }
  return true;
}

export async function deleteAllStudentTips(uid: string): Promise<void> {
  const db = getAdminDb();
  if (!db) return;
  const snap = await db.collection(tipsCollectionPath(uid)).get();
  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  if (snap.docs.length) await batch.commit();
}
