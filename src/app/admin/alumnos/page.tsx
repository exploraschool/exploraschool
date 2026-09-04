import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminStudentsDirectory,
  type AdminStudentListItem,
} from "@/components/admin/AdminStudentsDirectory";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { listStudentProfiles } from "@/lib/student-user-store";
import { canAccessStudentDashboard, isProfileReady } from "@/lib/student-users";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";

export default async function AdminAlumnosPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await requireAdminPanel();

  let students: AdminStudentListItem[] = [];
  if (isAdminConfigured()) {
    const profiles = await listStudentProfiles();
    const reportCounts = new Map<string, number>();
    const db = getAdminDb();
    if (db) {
      try {
        const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
        for (const doc of snap.docs) {
          const report = parseProgressReport(doc.id, doc.data() as Record<string, unknown>);
          if (!report.studentUid) continue;
          reportCounts.set(report.studentUid, (reportCounts.get(report.studentUid) ?? 0) + 1);
        }
      } catch {
        /* ignore */
      }
    }
    students = profiles.map((student) => ({
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
    }));
  }

  return (
    <AdminShell
      active="alumnos"
      title="Alumnos"
      description="Elige un alumno registrado. Cualquier miembro del equipo puede ver y actualizar su ficha."
    >
      <AdminStudentsDirectory initialStudents={students} />
    </AdminShell>
  );
}
