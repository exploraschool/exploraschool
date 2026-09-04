import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { getStudentProfile } from "@/lib/student-user-store";
import {
  deleteStudentTip,
  listStudentTips,
  updateStudentTip,
} from "@/lib/student-tips";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ uid: string; tipId: string }> };

const patchSchema = z.object({
  text: z.string().min(1).max(4000).optional(),
  pinned: z.boolean().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid, tipId } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  try {
    const tip = await updateStudentTip(uid, tipId, parsed.data);
    if (!tip) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const tips = await listStudentTips(uid);
    return NextResponse.json({ tip, tips });
  } catch (error) {
    console.error("[admin/students/tips] patch failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid, tipId } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const ok = await deleteStudentTip(uid, tipId);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const tips = await listStudentTips(uid);
    return NextResponse.json({ ok: true, tips });
  } catch (error) {
    console.error("[admin/students/tips] delete failed:", error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
