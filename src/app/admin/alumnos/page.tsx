import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminStudentsDirectory,
  type AdminStudentListItem,
} from "@/components/admin/AdminStudentsDirectory";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { isExploraWorkspaceSlug } from "@/lib/admin-workspace-config";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { listStudentProfiles } from "@/lib/student-user-store";
import { canAccessStudentDashboard, isProfileReady } from "@/lib/student-users";
import {
  buildStudentDirectoryStats,
  listStudentUidsForInstructor,
} from "@/lib/student-directory";

export default async function AdminAlumnosPage() {
  await requireAdminPanel();

  let students: AdminStudentListItem[] = [];
  let instructorFilter: string | null = null;

  if (isAdminConfigured()) {
    let profiles = await listStudentProfiles();
    const selected = await getSelectedInstructorSlug();
    if (selected && !isExploraWorkspaceSlug(selected)) {
      instructorFilter = selected;
      const allowed = await listStudentUidsForInstructor(selected);
      profiles = profiles.filter((profile) => allowed.has(profile.uid));
    }

    const stats = await buildStudentDirectoryStats(profiles);
    students = profiles.map((student) => {
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
    });
  }

  return (
    <AdminShell
      active="alumnos"
      title="Alumnos"
      description={
        instructorFilter
          ? `Vista filtrada por monitor (${instructorFilter}): tips, medias pendientes y fichas.`
          : "Busca un alumno, abre su ficha, elige el monitor y deja tips o progreso."
      }
    >
      <AdminStudentsDirectory initialStudents={students} />
    </AdminShell>
  );
}
