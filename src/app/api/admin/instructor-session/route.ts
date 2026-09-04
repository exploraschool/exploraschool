import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-auth-config";
import { ADMIN_WORKSPACE_EXPLORA } from "@/lib/admin-workspace-config";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { instructorSlugCookieOptions, INSTRUCTOR_SLUG_COOKIE } from "@/lib/instructor-session";

export const runtime = "nodejs";

const bodySchema = z.object({
  slug: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const slug = parsed.data.slug.trim();
  const cookieStore = await cookies();
  const maxAge = Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000);

  if (slug === ADMIN_WORKSPACE_EXPLORA) {
    cookieStore.set(INSTRUCTOR_SLUG_COOKIE, ADMIN_WORKSPACE_EXPLORA, instructorSlugCookieOptions(maxAge));
    return NextResponse.json({ ok: true, slug: ADMIN_WORKSPACE_EXPLORA, kind: "explora", name: "Explora" });
  }

  const instructor = await getInstructorFromDb(slug);
  if (!instructor || !instructor.active) {
    return NextResponse.json({ error: "instructor_not_found" }, { status: 404 });
  }

  cookieStore.set(INSTRUCTOR_SLUG_COOKIE, instructor.slug, instructorSlugCookieOptions(maxAge));
  return NextResponse.json({
    ok: true,
    slug: instructor.slug,
    kind: "instructor",
    name: instructor.name,
  });
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.delete(INSTRUCTOR_SLUG_COOKIE);
  return NextResponse.json({ ok: true });
}
