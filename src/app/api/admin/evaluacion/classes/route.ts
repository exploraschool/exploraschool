import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
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

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const slug = await getSelectedInstructorSlug();
  if (!slug) {
    return NextResponse.json({ error: "no_instructor" }, { status: 400 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ classes: [] });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ classes: [] });

  const bookings = db.collection("leads").where("type", "==", "booking");
  let docs = (
    await bookings.where("instructorSlugs", "array-contains", slug).orderBy("createdAt", "desc").limit(80).get().catch(() => null)
  )?.docs;

  if (!docs?.length) {
    const recent = await bookings.orderBy("createdAt", "desc").limit(200).get();
    docs = recent.docs.filter((doc) => {
      const data = doc.data() as StoredLead;
      const items = data.bookingItems ?? [];
      const slugs = data.instructorSlugs?.length ? data.instructorSlugs : collectInstructorSlugs(items);
      return slugs.includes(slug);
    });
  }

  const classes = docs.flatMap((doc) => {
    const data = doc.data() as StoredLead;
    return (data.bookingItems ?? []).flatMap((item, itemIndex) => {
      if (effectiveInstructorSlug(item) !== slug) return [];
      const product = getProductBySlug(item.productId as ProductId);
      return [
        {
          leadId: doc.id,
          itemIndex,
          reportId: progressReportId(doc.id, itemIndex),
          status: data.status,
          studentName: data.name,
          studentEmail: data.email,
          date: item.date,
          timeSlotLabel: item.timeSlotLabel,
          productTitle: product?.titleEs || item.productId,
          discipline: item.discipline,
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

  return NextResponse.json({ classes, instructorSlug: slug });
}
