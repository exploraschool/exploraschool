import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isExploraWorkspaceSlug } from "@/lib/admin-workspace-config";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { listStudentProfiles } from "@/lib/student-user-store";
import { canAccessStudentDashboard, isProfileReady } from "@/lib/student-users";
import {
  buildStudentDirectoryStats,
  listStudentUidsForInstructor,
} from "@/lib/student-directory";

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

  let students = await listStudentProfiles();
  const selected = await getSelectedInstructorSlug();
  if (selected && !isExploraWorkspaceSlug(selected)) {
    const allowed = await listStudentUidsForInstructor(selected);
    students = students.filter((student) => allowed.has(student.uid));
  }

  const filtered = q
    ? students.filter((student) => {
        const hay = `${student.displayName} ${student.email}`.toLowerCase();
        return hay.includes(q);
      })
    : students;

  const stats = await buildStudentDirectoryStats(filtered);

  return NextResponse.json({
    students: filtered.map((student) => {
      const row = stats.get(student.uid);
      return {
        uid: student.uid,
        email: student.email,
        displayName: student.displayName,
        photoURL: student.photoURL,
        selfLevel: student.selfLevel,
        disciplines: student.disciplines,
        profileReady: isProfileReady(student),
        onboardingComplete: canAccessStudentDashboard(student),
        reportCount: row?.reportCount ?? 0,
        lastReportAt: row?.lastReportAt ?? "",
        pendingMediaCount: row?.pendingMediaCount ?? 0,
        hasPinnedTip: row?.hasPinnedTip ?? Boolean(student.staffTips?.trim()),
        tipPreview: row?.tipPreview ?? (student.staffTips || "").trim().slice(0, 80),
        updatedAt: student.updatedAt,
        staffTips: student.staffTips,
      };
    }),
  });
}
