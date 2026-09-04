import { cookies } from "next/headers";
import {
  ADMIN_GOOGLE_EMAIL,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-auth-config";
import { getAdminAuth } from "@/lib/firebase/admin";

export { ADMIN_GOOGLE_EMAIL, ADMIN_SESSION_COOKIE };

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return normalizeAdminEmail(email) === normalizeAdminEmail(ADMIN_GOOGLE_EMAIL);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (!decoded.email_verified || !isAllowedAdminEmail(decoded.email)) {
      return null;
    }
    return { email: String(decoded.email) };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}
