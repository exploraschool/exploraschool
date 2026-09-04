import { NextResponse } from "next/server";
import { getProductBySlug, type ProductId } from "@/data/products";
import { ACCOUNT_MEETING_POINT_ES } from "@/data/student-account";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { buildLessonIcs } from "@/lib/ics";
import { listStudentBookingLeads } from "@/lib/link-bookings";
import { getStudentSession } from "@/lib/student-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ leadId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { leadId } = await params;
  const leads = await listStudentBookingLeads(db, { uid: session.uid, email: session.email });
  const match = leads.find((lead) => lead.id === leadId);
  if (!match) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const item = match.data.bookingItems?.[0];
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const product = getProductBySlug(item.productId as ProductId);
  const title = product ? `Explora · ${product.titleEs}` : "Clase Explora School";
  const ics = buildLessonIcs({
    title,
    date: item.date,
    timeSlotId: item.timeSlotId,
    location: ACCOUNT_MEETING_POINT_ES,
    description: `${item.timeSlotLabel} · ${item.discipline}`,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="explora-${item.date}.ics"`,
    },
  });
}
