import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";
import { markStudentProgressSeen } from "@/lib/student-user-store";

export const runtime = "nodejs";

export async function POST() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await markStudentProgressSeen(session.uid);
  return NextResponse.json({ ok: true });
}
