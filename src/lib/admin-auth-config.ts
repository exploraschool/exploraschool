/** Only this Google account can open the admin panel. */
export const ADMIN_GOOGLE_EMAIL = "explora.sclub@gmail.com";

export const ADMIN_SESSION_COOKIE = "explora_admin_session";

/** Session lifetime: 5 days (Firebase session cookies max 2 weeks). */
export const ADMIN_SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;
