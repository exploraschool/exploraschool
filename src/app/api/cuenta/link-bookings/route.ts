import { NextResponse } from "next/server";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getStudentIdentity } from "@/lib/student-auth";
import { linkBookingLeadsToStudent } from "@/lib/link-bookings";
import { upsertStudentProfile } from "@/lib/student-user-store";

export const runtime = "nodejs";

export async function POST() {
  const session = await getStudentIdentity();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ linked: 0, leadIds: [] });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ linked: 0, leadIds: [] });
  }

  const result = await linkBookingLeadsToStudent(db, {
    uid: session.uid,
    email: session.email,
  });

  if (result.linked > 0) {
    await upsertStudentProfile(session.uid, {
      email: session.email,
      displayName: session.name,
      photoURL: session.picture,
      hasTakenClassesBefore: true,
    });
  }

  return NextResponse.json(result);
}
