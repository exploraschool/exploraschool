import { cookies } from "next/headers";
import { INSTRUCTOR_SLUG_COOKIE } from "@/lib/student-auth-config";

export { INSTRUCTOR_SLUG_COOKIE };

export async function getSelectedInstructorSlug(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(INSTRUCTOR_SLUG_COOKIE)?.value?.trim();
  return value || null;
}

export function instructorSlugCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
