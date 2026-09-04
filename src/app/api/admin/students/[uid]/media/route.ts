import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import {
  listStudentMediaForUid,
  unlinkStudentMediaFromGallery,
  updateStudentMediaCorrection,
} from "@/lib/student-media";
import { getStudentProfile } from "@/lib/student-user-store";

export const runtime = "nodejs";

const patchSchema = z.object({
  mediaId: z.string().min(1),
  correctionNotes: z.string().max(5000).optional(),
  reviewedByInstructorSlug: z.string().max(80).optional(),
  markReviewed: z.boolean().optional(),
  unlinkGallery: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ uid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { uid } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const media = await listStudentMediaForUid(uid);
  return NextResponse.json({ media });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  if (parsed.data.unlinkGallery) {
    await unlinkStudentMediaFromGallery(parsed.data.mediaId);
  }

  const media = await updateStudentMediaCorrection(parsed.data.mediaId, {
    correctionNotes: parsed.data.correctionNotes,
    reviewedAt: parsed.data.markReviewed ? new Date().toISOString() : undefined,
    reviewedByInstructorSlug: parsed.data.reviewedByInstructorSlug,
  });

  if (!media || media.studentUid !== uid) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ media });
}
