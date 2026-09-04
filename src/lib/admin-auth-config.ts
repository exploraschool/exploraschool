/** Corporate Google account with full admin (reservas, alumnos, etc.). */
export const ADMIN_GOOGLE_EMAIL = "explora.sclub@gmail.com";

/** Restricted Google account: affiliate blog studio only. */
export const AFFILIATE_EDITOR_GOOGLE_EMAIL = "alemv.mlg@gmail.com";

export const STAFF_GOOGLE_EMAILS = [
  ADMIN_GOOGLE_EMAIL,
  AFFILIATE_EDITOR_GOOGLE_EMAIL,
] as const;

export type StaffRole = "admin" | "affiliate_editor";

export const ADMIN_SESSION_COOKIE = "explora_admin_session";

/** Session lifetime: 5 days (Firebase session cookies max 2 weeks). */
export const ADMIN_SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

export function normalizeStaffEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getStaffRole(email: string | null | undefined): StaffRole | null {
  if (!email) return null;
  const normalized = normalizeStaffEmail(email);
  if (normalized === normalizeStaffEmail(ADMIN_GOOGLE_EMAIL)) return "admin";
  if (normalized === normalizeStaffEmail(AFFILIATE_EDITOR_GOOGLE_EMAIL)) {
    return "affiliate_editor";
  }
  return null;
}

export function isAllowedStaffEmail(email: string | null | undefined): boolean {
  return getStaffRole(email) !== null;
}

export function isFullAdminEmail(email: string | null | undefined): boolean {
  return getStaffRole(email) === "admin";
}

export function isAffiliateEditorEmail(email: string | null | undefined): boolean {
  return getStaffRole(email) === "affiliate_editor";
}

export function staffHomePath(role: StaffRole): string {
  return role === "affiliate_editor" ? "/admin/blog" : "/admin/reservas";
}

export function staffCustomClaims(role: StaffRole): Record<string, boolean> {
  if (role === "admin") return { admin: true };
  return { affiliateEditor: true };
}
