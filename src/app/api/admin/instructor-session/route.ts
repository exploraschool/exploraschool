import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-auth-config";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { instructorSlugCookieOptions, INSTRUCTOR_SLUG_COOKIE } from "@/lib/instructor-session";
import { cookies } from "next/headers";

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

  const instructor = await getInstructorFromDb(parsed.data.slug);
  if (!instructor || !instructor.active) {
    return NextResponse.json({ error: "instructor_not_found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    INSTRUCTOR_SLUG_COOKIE,
    instructor.slug,
    instructorSlugCookieOptions(Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000)),
  );

  return NextResponse.json({ ok: true, slug: instructor.slug, name: instructor.name });
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.delete(INSTRUCTOR_SLUG_COOKIE);
  return NextResponse.json({ ok: true });
}
