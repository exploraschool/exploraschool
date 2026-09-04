import {
  collectInstructorSlugs,
  effectiveInstructorSlug,
  type StoredLead,
} from "@/lib/leads";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";
import { listStudentMediaForUid } from "@/lib/student-media";
import type { StudentProfile } from "@/lib/student-users";

export type StudentDirectoryStats = {
  reportCount: number;
  lastReportAt: string;
  pendingMediaCount: number;
  hasPinnedTip: boolean;
  tipPreview: string;
};

export async function buildStudentDirectoryStats(
  profiles: StudentProfile[],
): Promise<Map<string, StudentDirectoryStats>> {
  const map = new Map<string, StudentDirectoryStats>();
  for (const profile of profiles) {
    map.set(profile.uid, {
      reportCount: 0,
      lastReportAt: "",
      pendingMediaCount: 0,
      hasPinnedTip: Boolean(profile.staffTips?.trim()),
      tipPreview: (profile.staffTips || "").trim().slice(0, 80),
    });
  }

  const db = getAdminDb();
  if (!db) return map;

  try {
    const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
    for (const doc of snap.docs) {
      const report = parseProgressReport(doc.id, doc.data() as Record<string, unknown>);
      if (!report.studentUid || !map.has(report.studentUid)) continue;
      const row = map.get(report.studentUid)!;
      row.reportCount += 1;
      if (!row.lastReportAt || report.updatedAt > row.lastReportAt) {
        row.lastReportAt = report.updatedAt;
      }
    }
  } catch (error) {
    console.error("[student-directory] report stats failed:", error);
  }

  await Promise.all(
    profiles.map(async (profile) => {
      try {
        const media = await listStudentMediaForUid(profile.uid);
        const pending = media.filter((item) => !item.reviewedAt).length;
        const row = map.get(profile.uid);
        if (row) row.pendingMediaCount = pending;
      } catch {
        /* ignore */
      }
    }),
  );

  return map;
}

/** Student uids that have bookings or reports attributed to this instructor. */
export async function listStudentUidsForInstructor(instructorSlug: string): Promise<Set<string>> {
  const uids = new Set<string>();
  const db = getAdminDb();
  if (!db || !instructorSlug) return uids;

  try {
    const reportSnap = await db
      .collection(PROGRESS_REPORTS_COLLECTION)
      .where("instructorSlug", "==", instructorSlug)
      .get()
      .catch(async () => {
        const all = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
        return {
          docs: all.docs.filter((doc) => doc.data().instructorSlug === instructorSlug),
        };
      });
    for (const doc of reportSnap.docs) {
      const uid = String(doc.data().studentUid || "");
      if (uid) uids.add(uid);
    }
  } catch (error) {
    console.error("[student-directory] instructor reports failed:", error);
  }

  try {
    const bookings = db.collection("leads").where("type", "==", "booking");
    let docs = (
      await bookings.where("instructorSlugs", "array-contains", instructorSlug).limit(200).get().catch(() => null)
    )?.docs;

    if (!docs?.length) {
      const recent = await bookings.orderBy("createdAt", "desc").limit(300).get().catch(() => null);
      docs = recent?.docs.filter((doc) => {
        const data = doc.data() as StoredLead;
        const items = data.bookingItems ?? [];
        const slugs = data.instructorSlugs?.length ? data.instructorSlugs : collectInstructorSlugs(items);
        return slugs.includes(instructorSlug);
      });
    }

    for (const doc of docs ?? []) {
      const data = doc.data() as StoredLead;
      if (data.studentUid) {
        const hasItem = (data.bookingItems ?? []).some(
          (item) => effectiveInstructorSlug(item) === instructorSlug,
        );
        if (hasItem) uids.add(data.studentUid);
      }
    }
  } catch (error) {
    console.error("[student-directory] instructor leads failed:", error);
  }

  return uids;
}
