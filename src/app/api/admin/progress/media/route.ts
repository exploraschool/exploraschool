import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { parseProgressReport, PROGRESS_REPORTS_COLLECTION } from "@/lib/progress-reports";

export const runtime = "nodejs";

const bodySchema = z.object({
  reportId: z.string().min(1),
  mediaId: z.string().min(1),
});

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

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const ref = db.collection(PROGRESS_REPORTS_COLLECTION).doc(parsed.data.reportId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const report = parseProgressReport(parsed.data.reportId, snap.data() as Record<string, unknown>);
  const media = report.media.find((item) => item.id === parsed.data.mediaId);
  const nextMedia = report.media.filter((item) => item.id !== parsed.data.mediaId);

  if (media) {
    try {
      await bucket.file(media.storagePath).delete({ ignoreNotFound: true });
    } catch (error) {
      console.error("[progress/media] delete storage failed:", error);
    }
  }

  await ref.update({ media: nextMedia, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, media: nextMedia });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    reportId?: string;
    media?: unknown;
  } | null;
  const reportId = body?.reportId?.trim();
  if (!reportId || !Array.isArray(body?.media)) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  await db.collection(PROGRESS_REPORTS_COLLECTION).doc(reportId).set(
    { media: body.media, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  return NextResponse.json({ ok: true });
}
