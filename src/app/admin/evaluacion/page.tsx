import { redirect } from "next/navigation";
import Link from "next/link";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  collectInstructorSlugs,
  effectiveInstructorName,
  effectiveInstructorSlug,
  type StoredLead,
} from "@/lib/leads";
import { getDisciplineDisplayName, type MainDisciplineId, type ModalityId } from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { progressReportId } from "@/lib/progress-reports";

export default async function EvaluacionPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const slug = await getSelectedInstructorSlug();
  if (!slug) redirect("/admin/hoy");
  const instructor = await getInstructorFromDb(slug);

  let classes: Array<{
    leadId: string;
    itemIndex: number;
    status: string;
    studentName: string;
    studentEmail: string;
    date: string;
    timeSlotLabel: string;
    productTitle: string;
    disciplineLabel: string;
    instructorName: string;
  }> = [];

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const bookings = db.collection("leads").where("type", "==", "booking");
      let docs = (
        await bookings
          .where("instructorSlugs", "array-contains", slug)
          .orderBy("createdAt", "desc")
          .limit(80)
          .get()
          .catch(() => ({ docs: [] as QueryDocumentSnapshot[] }))
      ).docs;

      if (!docs.length) {
        const recent = await bookings.orderBy("createdAt", "desc").limit(200).get();
        docs = recent.docs.filter((doc) => {
          const data = doc.data() as StoredLead;
          const items = data.bookingItems ?? [];
          const slugs = data.instructorSlugs?.length ? data.instructorSlugs : collectInstructorSlugs(items);
          return slugs.includes(slug);
        });
      }

      classes = docs.flatMap((doc) => {
        const data = doc.data() as StoredLead;
        return (data.bookingItems ?? []).flatMap((item, itemIndex) => {
          if (effectiveInstructorSlug(item) !== slug) return [];
          const product = getProductBySlug(item.productId as ProductId);
          return [
            {
              leadId: doc.id,
              itemIndex,
              status: data.status ?? "pending",
              studentName: data.name,
              studentEmail: data.email,
              date: item.date,
              timeSlotLabel: item.timeSlotLabel,
              productTitle: product?.titleEs || item.productId,
              disciplineLabel:
                getDisciplineDisplayName(
                  "es",
                  item.discipline as MainDisciplineId | undefined,
                  item.modality as ModalityId | undefined,
                ) || item.discipline,
              instructorName: effectiveInstructorName(item),
            },
          ];
        });
      });
    }
  }

  return (
    <AdminShell
      active="evaluacion"
      title={`Evaluación · ${instructor?.name ?? slug}`}
      description="Clases y alumnos asignados a este perfil. Abre una ficha para puntuar técnica, notas y media."
    >
      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold">No hay clases asignadas</p>
          <p className="mt-2 text-sm text-muted">
            Asigna este instructor en Reservas o pide que el alumno lo elija al reservar.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {classes.map((item) => (
            <li key={progressReportId(item.leadId, item.itemIndex)}>
              <Link
                href={`/admin/evaluacion/${item.leadId}/${item.itemIndex}`}
                className="block rounded-2xl border border-hielo/10 bg-white px-5 py-4 transition hover:border-hielo/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg font-semibold text-pizarra">{item.studentName}</p>
                  <span className="text-xs font-semibold uppercase text-muted">{item.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {item.date} · {item.timeSlotLabel} · {item.productTitle} · {item.disciplineLabel}
                </p>
                <p className="mt-1 text-xs text-muted">{item.studentEmail}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
