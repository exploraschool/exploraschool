import { cookies } from "next/headers";
import { ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-auth-config";

export async function setHttpOnlyCookie(name: string, value: string, maxAgeMs = ADMIN_SESSION_MAX_AGE_MS) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

export async function clearHttpOnlyCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
