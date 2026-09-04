import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProgressForm } from "@/components/instructor/ProgressForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { listActiveInstructorsFromDb } from "@/lib/instructors-db";
import { effectiveInstructorSlug, type StoredLead } from "@/lib/leads";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION, progressReportId } from "@/lib/progress-reports";
import { TIME_SLOTS, type TimeSlotId } from "@/lib/booking-config";
import { getProductBySlug, type ProductId } from "@/data/products";
import { getDisciplineDisplayName, type MainDisciplineId, type ModalityId } from "@/data/disciplines";

type Props = { params: Promise<{ leadId: string; itemIndex: string }> };

export default async function EvaluacionFichaPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await requireAdminPanel();
  if (!isAdminConfigured()) notFound();
  const db = getAdminDb();
  if (!db) notFound();

  const { leadId, itemIndex: itemIndexRaw } = await params;
  const itemIndex = Number(itemIndexRaw);
  if (!Number.isInteger(itemIndex) || itemIndex < 0) notFound();

  const leadSnap = await db.collection("leads").doc(leadId).get();
  if (!leadSnap.exists) notFound();
  const lead = leadSnap.data() as StoredLead;
  const item = lead.bookingItems?.[itemIndex];
  if (!item) notFound();

  const reportId = progressReportId(leadId, itemIndex);
  const reportSnap = await db.collection(PROGRESS_REPORTS_COLLECTION).doc(reportId).get();
  const report = reportSnap.exists
    ? parseProgressReport(reportId, reportSnap.data() as Record<string, unknown>)
    : null;

  const product = getProductBySlug(item.productId as ProductId);
  const slot = TIME_SLOTS[item.timeSlotId as TimeSlotId];
  const disciplineLabel =
    getDisciplineDisplayName(
      "es",
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    ) || item.discipline;

  const instructors = (await listActiveInstructorsFromDb()).map((itemInstructor) => ({
    slug: itemInstructor.slug,
    name: itemInstructor.name,
  }));

  return (
    <AdminShell
      active="alumnos"
      title="Ficha de progreso"
      description={`${lead.name} · ${item.date} · ${disciplineLabel}`}
    >
      <ProgressForm
        leadId={leadId}
        itemIndex={itemIndex}
        studentName={lead.name}
        studentEmail={lead.email}
        dateLabel={`${item.date} · ${item.timeSlotLabel} · ${product?.titleEs || item.productId}`}
        defaultDiscipline={item.modality || item.discipline || "esqui"}
        defaultHours={slot?.hours ?? product?.hours ?? 2}
        initial={report}
        instructors={instructors}
        defaultInstructorSlug={report?.instructorSlug || effectiveInstructorSlug(item)}
      />
    </AdminShell>
  );
}
