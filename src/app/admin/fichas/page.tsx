import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";
import { progressDisciplineName, type ProgressDisciplineId } from "@/data/progress-skills";

export default async function AdminFichasPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  let reports: ReturnType<typeof parseProgressReport>[] = [];
  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
      reports = snap.docs
        .map((doc) => parseProgressReport(doc.id, doc.data() as Record<string, unknown>))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
  }

  return (
    <AdminShell
      active="fichas"
      title="Auditoría de fichas"
      description="Revisa y edita cualquier ficha de progreso y los archivos subidos por el equipo."
    >
      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-12 text-center text-sm text-muted">
          Aún no hay fichas de progreso.
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border border-hielo/10 bg-white px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{report.studentName || report.studentEmail}</p>
                  <p className="text-sm text-muted">
                    {report.instructorName} ·{" "}
                    {progressDisciplineName(report.discipline as ProgressDisciplineId, "es")} · {report.hours} h ·{" "}
                    {"★".repeat(report.rating)}
                  </p>
                  <p className="mt-1 text-xs text-muted">{report.media.length} archivo(s)</p>
                </div>
                <Link
                  href={`/admin/evaluacion/${report.leadId}/${report.itemIndex}`}
                  className="btn-secondary !w-auto"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
