import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isExploraWorkspaceSlug } from "@/lib/admin-workspace-config";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getInstructorFromDb } from "@/lib/instructors-db";
import {
  effectiveInstructorName,
  effectiveInstructorSlug,
  type StoredLead,
} from "@/lib/leads";
import {
  mediaKindFromContentType,
  parseProgressReport,
  PROGRESS_MEDIA_MAX,
  PROGRESS_REPORTS_COLLECTION,
  progressReportId,
  type ProgressMedia,
  type ProgressReport,
} from "@/lib/progress-reports";
import { isProgressDiscipline } from "@/data/progress-skills";
import { TIME_SLOTS, type TimeSlotId } from "@/lib/booking-config";
import { getProductBySlug, type ProductId } from "@/data/products";
import { FieldValue } from "firebase-admin/firestore";
import { findStudentUidByEmail } from "@/lib/student-user-store";
import { createStudentTip } from "@/lib/student-tips";
import { sendStudentProgressUpdateEmail } from "@/lib/lead-emails";

export const runtime = "nodejs";

const ALLOWED_UPLOAD = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) return null;
  if (!isAdminConfigured()) return "unavailable" as const;
  const db = getAdminDb();
  return db || ("unavailable" as const);
}

export async function GET(request: Request) {
  const db = await requireAdmin();
  if (db === null) return unauthorized();
  if (db === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");
  const itemIndexRaw = searchParams.get("itemIndex");
  const instructorFilter = searchParams.get("instructor");

  if (leadId && itemIndexRaw !== null) {
    const itemIndex = Number(itemIndexRaw);
    const companionId = searchParams.get("companionId") || undefined;
    const id = progressReportId(leadId, itemIndex, companionId);
    const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).doc(id).get();
    return NextResponse.json({
      report: snap.exists ? parseProgressReport(id, snap.data() as Record<string, unknown>) : null,
    });
  }

  const snap = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
  let reports = snap.docs.map((doc) => parseProgressReport(doc.id, doc.data() as Record<string, unknown>));
  if (instructorFilter) {
    reports = reports.filter((report) => report.instructorSlug === instructorFilter);
  }
  reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ reports });
}

const saveSchema = z.object({
  leadId: z.string().min(1).max(80),
  itemIndex: z.number().int().min(0).max(40),
  discipline: z.string().min(1).max(40),
  instructorSlug: z.string().min(1).max(80).optional(),
  skills: z.record(z.string(), z.number().min(1).max(5)).optional().default({}),
  rating: z.number().min(1).max(5),
  notes: z.string().max(5000).optional().default(""),
  nextFocus: z.string().max(500).optional().default(""),
  recommendedPistaIds: z.array(z.string()).max(20).optional().default([]),
  hours: z.number().min(0).max(24).optional(),
  companionId: z.string().max(80).optional(),
  media: z
    .array(
      z.object({
        id: z.string(),
        storagePath: z.string(),
        contentType: z.string(),
        kind: z.enum(["image", "video"]),
        fileName: z.string(),
        createdAt: z.string(),
      }),
    )
    .max(PROGRESS_MEDIA_MAX)
    .optional(),
});

export async function POST(request: Request) {
  const db = await requireAdmin();
  if (db === null) return unauthorized();
  if (db === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }
  if (!isProgressDiscipline(parsed.data.discipline)) {
    return NextResponse.json({ error: "invalid_discipline" }, { status: 400 });
  }

  const leadSnap = await db.collection("leads").doc(parsed.data.leadId).get();
  if (!leadSnap.exists) {
    return NextResponse.json({ error: "lead_not_found" }, { status: 404 });
  }
  const lead = leadSnap.data() as StoredLead;
  const item = lead.bookingItems?.[parsed.data.itemIndex];
  if (!item) {
    return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  }

  const selectedRaw = await getSelectedInstructorSlug();
  const bodySlug = parsed.data.instructorSlug?.trim() || "";
  const selectedSlug =
    bodySlug ||
    (selectedRaw && !isExploraWorkspaceSlug(selectedRaw) ? selectedRaw : "") ||
    effectiveInstructorSlug(item);
  const instructor = selectedSlug ? await getInstructorFromDb(selectedSlug) : null;
  if (bodySlug && !instructor) {
    return NextResponse.json({ error: "invalid_instructor" }, { status: 400 });
  }
  const slot = TIME_SLOTS[item.timeSlotId as TimeSlotId];
  const product = getProductBySlug(item.productId as ProductId);
  const companionId = parsed.data.companionId?.trim() || undefined;
  const id = progressReportId(parsed.data.leadId, parsed.data.itemIndex, companionId);
  const existing = await db.collection(PROGRESS_REPORTS_COLLECTION).doc(id).get();
  const previous = existing.exists
    ? parseProgressReport(id, existing.data() as Record<string, unknown>)
    : null;
  const now = new Date().toISOString();

  let studentUid = lead.studentUid || "";
  if (!studentUid && lead.email) {
    const matched = await findStudentUidByEmail(lead.email);
    if (matched) {
      studentUid = matched;
      await leadSnap.ref.update({
        studentUid: matched,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  const nextFocus = (parsed.data.nextFocus ?? "").trim();
  const instructorSlugFinal = instructor?.slug || selectedSlug || effectiveInstructorSlug(item);
  const instructorNameFinal = instructor?.name || effectiveInstructorName(item);

  const report: ProgressReport = {
    id,
    leadId: parsed.data.leadId,
    itemIndex: parsed.data.itemIndex,
    studentUid,
    studentEmail: lead.email,
    studentName: lead.name,
    companionId,
    instructorSlug: instructorSlugFinal,
    instructorName: instructorNameFinal,
    discipline: parsed.data.discipline,
    skills: parsed.data.skills,
    rating: parsed.data.rating,
    notes: parsed.data.notes,
    nextFocus,
    recommendedPistaIds: parsed.data.recommendedPistaIds,
    hours: parsed.data.hours ?? previous?.hours ?? slot?.hours ?? product?.hours ?? 0,
    media: parsed.data.media ?? previous?.media ?? [],
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  await db.collection(PROGRESS_REPORTS_COLLECTION).doc(id).set(report);

  if (studentUid && nextFocus && nextFocus !== (previous?.nextFocus || "").trim()) {
    try {
      await createStudentTip(studentUid, {
        text: nextFocus,
        authorSlug: instructorSlugFinal || "explora",
        authorName: instructorNameFinal || "Explora",
        source: "report",
        pinned: false,
        discipline: parsed.data.discipline,
      });
    } catch (tipError) {
      console.error("[admin/progress] tip from nextFocus failed:", tipError);
    }
  }

  let studentEmailSent = false;
  let studentEmailError: string | undefined;
  if (report.studentEmail?.trim()) {
    try {
      await sendStudentProgressUpdateEmail(report, { isNew: !previous });
      studentEmailSent = true;
    } catch (emailError) {
      studentEmailError = emailError instanceof Error ? emailError.message : "Email send failed";
      console.error("[admin/progress] Student progress email failed:", studentEmailError);
    }
  }

  return NextResponse.json({
    ok: true,
    report,
    studentEmailSent,
    studentEmailError,
  });
}

const uploadSchema = z.object({
  leadId: z.string().min(1),
  itemIndex: z.number().int().min(0),
  companionId: z.string().max(80).optional(),
  contentType: z.string().min(3).max(80),
  fileName: z.string().min(1).max(180),
});

export async function PUT(request: Request) {
  const db = await requireAdmin();
  if (db === null) return unauthorized();
  if (db === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const parsed = uploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }
  const contentType = parsed.data.contentType.toLowerCase();
  if (!ALLOWED_UPLOAD.has(contentType)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const bucket = getAdminBucket();
  if (!bucket) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const reportId = progressReportId(
    parsed.data.leadId,
    parsed.data.itemIndex,
    parsed.data.companionId?.trim() || undefined,
  );
  const existing = await db.collection(PROGRESS_REPORTS_COLLECTION).doc(reportId).get();
  const currentMedia: ProgressMedia[] = existing.exists
    ? parseProgressReport(reportId, existing.data() as Record<string, unknown>).media
    : [];
  if (currentMedia.length >= PROGRESS_MEDIA_MAX) {
    return NextResponse.json({ error: "media_limit" }, { status: 400 });
  }

  const mediaId = crypto.randomUUID();
  const ext = parsed.data.fileName.split(".").pop()?.toLowerCase() || (contentType.startsWith("video/") ? "mp4" : "jpg");
  const storagePath = `progress/${reportId}/${mediaId}.${ext}`;
  const file = bucket.file(storagePath);
  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  const media: ProgressMedia = {
    id: mediaId,
    storagePath,
    contentType,
    kind: mediaKindFromContentType(contentType),
    fileName: parsed.data.fileName,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ uploadUrl, media });
}
