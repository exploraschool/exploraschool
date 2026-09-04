import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { createStudentMediaFromUpload, listStudentMediaForUid } from "@/lib/student-media";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const media = await listStudentMediaForUid(session.uid);
  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const profile = await getStudentProfile(session.uid);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  }

  try {
    const result = await createStudentMediaFromUpload({
      studentUid: session.uid,
      displayName: profile?.displayName || session.name || "Alumno",
      file,
    });
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "upload_failed";
    const status =
      code === "invalid_type" || code === "file_too_large" || code === "media_limit" ? 400 : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
