import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  mediaKindFromContentType,
  parseProgressReport,
  PROGRESS_MEDIA_MAX,
  PROGRESS_REPORTS_COLLECTION,
  progressReportId,
  type ProgressMedia,
} from "@/lib/progress-reports";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
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

  const form = await request.formData();
  const leadId = String(form.get("leadId") || "");
  const itemIndex = Number(form.get("itemIndex"));
  const file = form.get("file");
  if (!leadId || !Number.isInteger(itemIndex) || !(file instanceof File)) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const contentType = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const reportId = progressReportId(leadId, itemIndex);
  const existing = await db.collection(PROGRESS_REPORTS_COLLECTION).doc(reportId).get();
  const current: ProgressMedia[] = existing.exists
    ? parseProgressReport(reportId, existing.data() as Record<string, unknown>).media
    : [];
  if (current.length >= PROGRESS_MEDIA_MAX) {
    return NextResponse.json({ error: "media_limit" }, { status: 400 });
  }

  const mediaId = crypto.randomUUID();
  const ext = file.name.split(".").pop()?.toLowerCase() || (contentType.startsWith("video/") ? "mp4" : "jpg");
  const storagePath = `progress/${reportId}/${mediaId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await bucket.file(storagePath).save(buffer, {
    contentType,
    resumable: false,
    metadata: { cacheControl: "private, max-age=0" },
  });

  const media: ProgressMedia = {
    id: mediaId,
    storagePath,
    contentType,
    kind: mediaKindFromContentType(contentType),
    fileName: file.name,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ media });
}
