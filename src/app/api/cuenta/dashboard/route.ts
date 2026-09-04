import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";
import { loadStudentDashboard } from "@/lib/student-dashboard";

export const runtime = "nodejs";

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dashboard = await loadStudentDashboard(session);
  return NextResponse.json(dashboard);
}
