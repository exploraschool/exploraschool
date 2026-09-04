import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isExploraWorkspaceSlug } from "@/lib/admin-workspace-config";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getStudentProfile } from "@/lib/student-user-store";
import {
  createStudentTip,
  ensureTipsMigratedFromStaffTips,
  listStudentTips,
} from "@/lib/student-tips";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ uid: string }> };

const createSchema = z.object({
  text: z.string().min(1).max(4000),
  pinned: z.boolean().optional(),
  source: z.enum(["staff", "report", "correction"]).optional(),
  discipline: z
    .enum(["esqui", "snowboard", "telemark", "esqui-adaptado", "freeride", "freestyle"])
    .optional(),
  authorSlug: z.string().max(80).optional(),
  authorName: z.string().max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const tips = await ensureTipsMigratedFromStaffTips(uid, profile.staffTips);
  return NextResponse.json({ tips });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured() || !getAdminDb()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  let authorSlug = parsed.data.authorSlug?.trim() || "";
  let authorName = parsed.data.authorName?.trim() || "";
  if (!authorSlug) {
    const selected = await getSelectedInstructorSlug();
    if (selected && !isExploraWorkspaceSlug(selected)) {
      authorSlug = selected;
      const instructor = await getInstructorFromDb(selected);
      authorName = instructor?.name || selected;
    }
  }
  if (!authorName) authorName = authorSlug || "Explora";
  if (!authorSlug) authorSlug = "explora";

  await ensureTipsMigratedFromStaffTips(uid, profile.staffTips);

  try {
    const tip = await createStudentTip(uid, {
      text: parsed.data.text,
      pinned: parsed.data.pinned ?? false,
      source: parsed.data.source ?? "staff",
      discipline: parsed.data.discipline,
      authorSlug,
      authorName,
    });
    const tips = await listStudentTips(uid);
    return NextResponse.json({ tip, tips });
  } catch (error) {
    console.error("[admin/students/tips] create failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
