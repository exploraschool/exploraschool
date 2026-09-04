import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_GOOGLE_EMAIL,
  ADMIN_SESSION_COOKIE,
  getStaffRole,
  isAllowedStaffEmail,
  isFullAdminEmail,
  staffHomePath,
  type StaffRole,
} from "@/lib/admin-auth-config";
import { getAdminAuth } from "@/lib/firebase/admin";

export {
  ADMIN_GOOGLE_EMAIL,
  ADMIN_SESSION_COOKIE,
  AFFILIATE_EDITOR_GOOGLE_EMAIL,
  getStaffRole,
  isAllowedStaffEmail,
  isAffiliateEditorEmail,
  isFullAdminEmail,
  staffCustomClaims,
  staffHomePath,
  type StaffRole,
} from "@/lib/admin-auth-config";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Full Explora admin only — never the affiliate editor. */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  return isFullAdminEmail(email);
}

export type StaffSession = {
  email: string;
  role: StaffRole;
};

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (!decoded.email_verified || !isAllowedStaffEmail(decoded.email)) {
      return null;
    }
    const role = getStaffRole(decoded.email);
    if (!role) return null;
    return { email: String(decoded.email), role };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const staff = await getStaffSession();
  if (!staff || staff.role !== "admin") return null;
  return { email: staff.email };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function requireAffiliateBlogSession(): Promise<StaffSession> {
  const staff = await getStaffSession();
  if (!staff) redirect("/admin/login");
  return staff;
}
