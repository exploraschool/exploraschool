import { NextResponse } from "next/server";
import { z } from "zod";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import {
  completeStudentMediaUpload,
  createStudentMediaFromUpload,
  listStudentMediaForUid,
  prepareStudentMediaUpload,
  publishStudentMediaToGallery,
  unlinkStudentMediaFromGallery,
} from "@/lib/student-media";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { STUDENT_MEDIA_VIDEO_MAX_BYTES } from "@/lib/student-media-shared";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLIENT_ERRORS = new Set([
  "invalid_type",
  "invalid_file",
  "file_too_large",
  "media_limit",
  "video_too_long",
  "upload_incomplete",
  "forbidden",
]);

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "upload_failed";
  const status = CLIENT_ERRORS.has(code) ? 400 : code === "unavailable" ? 503 : 500;
  return NextResponse.json({ error: code }, { status });
}

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const media = await listStudentMediaForUid(session.uid);
  return NextResponse.json({ media });
}

const prepareSchema = z.object({
  fileName: z.string().min(1).max(180),
  contentType: z.string().max(80).optional().default(""),
  size: z.number().int().positive().max(STUDENT_MEDIA_VIDEO_MAX_BYTES),
  durationSeconds: z.number().positive().max(600).nullable().optional(),
});

export async function PUT(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const parsed = prepareSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  try {
    const prepared = await prepareStudentMediaUpload({
      studentUid: session.uid,
      fileName: parsed.data.fileName,
      contentType: parsed.data.contentType,
      size: parsed.data.size,
      durationSeconds: parsed.data.durationSeconds ?? null,
    });
    return NextResponse.json(prepared);
  } catch (error) {
    return errorResponse(error);
  }
}

const completeSchema = z.object({
  intent: z.literal("complete"),
  mediaId: z.string().uuid(),
  storagePath: z.string().min(1).max(300),
  contentType: z.string().min(3).max(80),
  fileName: z.string().min(1).max(180),
  durationSeconds: z.number().positive().max(600).nullable().optional(),
});

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const profile = await getStudentProfile(session.uid);
  const header = request.headers.get("content-type") || "";

  if (header.includes("application/json")) {
    const parsed = completeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_data" }, { status: 400 });
    }
    try {
      const result = await completeStudentMediaUpload({
        studentUid: session.uid,
        mediaId: parsed.data.mediaId,
        storagePath: parsed.data.storagePath,
        contentType: parsed.data.contentType,
        fileName: parsed.data.fileName,
        durationSeconds: parsed.data.durationSeconds ?? null,
      });
      return NextResponse.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  }
  const durationRaw = form.get("durationSeconds");
  const durationSeconds =
    typeof durationRaw === "string" && durationRaw.trim() ? Number(durationRaw) : null;

  try {
    const result = await createStudentMediaFromUpload({
      studentUid: session.uid,
      displayName: profile?.displayName || session.name || "Alumno",
      file,
      durationSeconds,
    });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.object({
  mediaId: z.string().min(1),
  action: z.enum(["publish", "unpublish"]),
});

export async function PATCH(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const profile = await getStudentProfile(session.uid);

  try {
    if (parsed.data.action === "unpublish") {
      const ok = await unlinkStudentMediaFromGallery(parsed.data.mediaId);
      if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const media = (await listStudentMediaForUid(session.uid)).find(
        (item) => item.id === parsed.data.mediaId,
      );
      if (!media || media.studentUid !== session.uid) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      return NextResponse.json({ media });
    }

    const media = await publishStudentMediaToGallery({
      mediaId: parsed.data.mediaId,
      studentUid: session.uid,
      displayName: profile?.displayName || session.name || "Alumno",
    });
    return NextResponse.json({ media, publishedToGallery: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "publish_failed";
    const status =
      code === "videos_not_allowed" ||
      code === "gallery_full" ||
      code === "not_found" ||
      code === "forbidden"
        ? 400
        : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
