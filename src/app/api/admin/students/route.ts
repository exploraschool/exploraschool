import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { listStudentProfiles } from "@/lib/student-user-store";
import { canAccessStudentDashboard, isProfileReady } from "@/lib/student-users";
import { getAdminDb } from "@/lib/firebase/admin";
import { PROGRESS_REPORTS_COLLECTION, parseProgressReport } from "@/lib/progress-reports";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const students = await listStudentProfiles();
  const filtered = q
    ? students.filter((student) => {
        const hay = `${student.displayName} ${student.email}`.toLowerCase();
        return hay.includes(q);
      })
    : students;

  const db = getAdminDb();
  const reportCounts = new Map<string, number>();
  if (db) {
    try {
      const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
      for (const doc of snap.docs) {
        const report = parseProgressReport(doc.id, doc.data() as Record<string, unknown>);
        if (!report.studentUid) continue;
        reportCounts.set(report.studentUid, (reportCounts.get(report.studentUid) ?? 0) + 1);
      }
    } catch (error) {
      console.error("[admin/students] report counts failed:", error);
    }
  }

  return NextResponse.json({
    students: filtered.map((student) => ({
      uid: student.uid,
      email: student.email,
      displayName: student.displayName,
      photoURL: student.photoURL,
      selfLevel: student.selfLevel,
      disciplines: student.disciplines,
      profileReady: isProfileReady(student),
      onboardingComplete: canAccessStudentDashboard(student),
      reportCount: reportCounts.get(student.uid) ?? 0,
      updatedAt: student.updatedAt,
      staffTips: student.staffTips,
    })),
  });
}
