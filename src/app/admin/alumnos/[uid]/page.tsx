import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStudentDetail } from "@/components/admin/AdminStudentDetail";
import { AdminStudentDeleteButton } from "@/components/admin/AdminStudentDeleteButton";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getStudentProfile } from "@/lib/student-user-store";
import { listActiveInstructorsFromDb } from "@/lib/instructors-db";
import { listStudentMediaForUid } from "@/lib/student-media";
import {
  parseProgressReport,
  PROGRESS_REPORTS_COLLECTION,
} from "@/lib/progress-reports";
import type { StoredLead } from "@/lib/leads";
import { ensureTipsMigratedFromStaffTips } from "@/lib/student-tips";

type Props = { params: Promise<{ uid: string }> };

export default async function AdminAlumnoDetailPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await requireAdminPanel();
  if (!isAdminConfigured()) notFound();

  const { uid } = await params;
  const profile = await getStudentProfile(uid);
  if (!profile) notFound();

  const instructors = (await listActiveInstructorsFromDb()).map((item) => ({
    slug: item.slug,
    name: item.name,
  }));

  const db = getAdminDb();
  const reports: ReturnType<typeof parseProgressReport>[] = [];
  const bookings: {
    leadId: string;
    itemIndex: number;
    status: string;
    productTitle: string;
    date: string;
    timeSlotId: string;
    discipline: string;
    instructorSlug: string;
    instructorName: string;
  }[] = [];
  if (db) {
    try {
      const reportSnap = await db
        .collection(PROGRESS_REPORTS_COLLECTION)
        .where("studentUid", "==", uid)
        .get()
        .catch(async () => {
          const all = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
          return {
            docs: all.docs.filter((doc) => {
              const data = doc.data() as Record<string, unknown>;
              return (
                data.studentUid === uid ||
                String(data.studentEmail || "").toLowerCase() === profile.email.toLowerCase()
              );
            }),
          };
        });
      for (const doc of reportSnap.docs) {
        reports.push(parseProgressReport(doc.id, doc.data() as Record<string, unknown>));
      }
      reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      /* ignore */
    }

    try {
      const leadSnap = await db
        .collection("leads")
        .where("studentUid", "==", uid)
        .get()
        .catch(async () => {
          const all = await db.collection("leads").get();
          return {
            docs: all.docs.filter((doc) => {
              const data = doc.data() as Record<string, unknown>;
              return (
                data.studentUid === uid ||
                String(data.email || "").toLowerCase() === profile.email.toLowerCase()
              );
            }),
          };
        });
      for (const doc of leadSnap.docs) {
        const lead = { id: doc.id, ...(doc.data() as StoredLead) };
        (lead.bookingItems ?? []).forEach((item, itemIndex) => {
          bookings.push({
            leadId: lead.id,
            itemIndex,
            status: lead.status,
            productTitle: item.productId,
            date: item.date,
            timeSlotId: item.timeSlotId,
            discipline: item.discipline,
            instructorSlug: item.assignedInstructorSlug || item.instructorSlug || "",
            instructorName: item.assignedInstructorName || item.instructorName || "",
          });
        });
      }
      bookings.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    } catch {
      /* ignore */
    }
  }

  const media = await listStudentMediaForUid(uid);
  const tips = await ensureTipsMigratedFromStaffTips(uid, profile.staffTips);

  return (
    <AdminShell
      active="alumnos"
      title={profile.displayName || profile.email}
      description="Perfil, tips, correcciones y fichas de progreso."
      actions={
        <div className="flex items-center gap-2">
          <AdminStudentDeleteButton uid={profile.uid} label={profile.displayName || profile.email} />
          <Link href="/admin/alumnos" className="rounded-full border border-hielo/15 px-3 py-1.5 text-sm font-semibold">
            ← Alumnos
          </Link>
        </div>
      }
    >
      <AdminStudentDetail
        profile={profile}
        reports={reports}
        bookings={bookings}
        media={media}
        instructors={instructors}
        initialTips={tips}
      />
    </AdminShell>
  );
}
