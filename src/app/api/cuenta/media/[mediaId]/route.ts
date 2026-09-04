import { NextResponse } from "next/server";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";
import { getStudentSession } from "@/lib/student-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ mediaId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { mediaId } = await params;
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId");
  const student = await getStudentSession();
  const admin = await isAdminAuthenticated();
  if (!student && !admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  let storagePath = "";
  let fileName = mediaId;
  let contentType = "application/octet-stream";

  const docs = reportId
    ? [(await db.collection(PROGRESS_REPORTS_COLLECTION).doc(reportId).get())].filter((doc) => doc.exists)
    : (await db.collection(PROGRESS_REPORTS_COLLECTION).get()).docs;

  for (const doc of docs) {
    const report = parseProgressReport(doc.id, doc.data() as Record<string, unknown>);
    if (!admin && student && report.studentUid !== student.uid) continue;
    const media = report.media.find((item) => item.id === mediaId);
    if (media) {
      storagePath = media.storagePath;
      fileName = media.fileName;
      contentType = media.contentType;
      break;
    }
  }

  if (!storagePath) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [url] = await bucket.file(storagePath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
    responseDisposition: `attachment; filename="${fileName.replace(/"/g, "")}"`,
    responseType: contentType,
  });

  return NextResponse.redirect(url);
}

