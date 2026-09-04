import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { collectInstructorSlugs, type StoredBookingItem } from "@/lib/leads";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  itemIndex: z.number().int().min(0).max(40),
  instructorSlug: z.string().max(80),
});

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const ref = db.collection("leads").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const data = snap.data() as { bookingItems?: StoredBookingItem[] };
  const items = [...(data.bookingItems ?? [])];
  const item = items[parsed.data.itemIndex];
  if (!item) {
    return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  }

  const slug = parsed.data.instructorSlug.trim();
  if (!slug) {
    item.assignedInstructorSlug = "";
    item.assignedInstructorName = "";
  } else {
    const instructor = await getInstructorFromDb(slug);
    if (!instructor) {
      return NextResponse.json({ error: "instructor_not_found" }, { status: 404 });
    }
    item.assignedInstructorSlug = instructor.slug;
    item.assignedInstructorName = instructor.name;
  }

  items[parsed.data.itemIndex] = item;
  await ref.update({
    bookingItems: items,
    instructorSlugs: collectInstructorSlugs(items),
  });

  return NextResponse.json({ ok: true, item });
}
