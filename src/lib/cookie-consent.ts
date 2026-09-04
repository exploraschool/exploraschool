export const COOKIE_CONSENT_KEY = "explora_cookies_accepted";
export const COOKIE_CONSENT_ACCEPTED = "1";
export const COOKIE_CONSENT_REJECTED = "0";

export const COOKIE_CONSENT_ACCEPTED_EVENT = "explora-cookies-accepted";
export const COOKIE_CONSENT_REJECTED_EVENT = "explora-cookies-rejected";

export type CookieConsent = "accepted" | "rejected" | null;

export function readCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === COOKIE_CONSENT_ACCEPTED) return "accepted";
  if (value === COOKIE_CONSENT_REJECTED) return "rejected";
  return null;
}

export function writeCookieConsent(consent: Exclude<CookieConsent, null>) {
  const value =
    consent === "accepted" ? COOKIE_CONSENT_ACCEPTED : COOKIE_CONSENT_REJECTED;
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(
    new Event(
      consent === "accepted" ? COOKIE_CONSENT_ACCEPTED_EVENT : COOKIE_CONSENT_REJECTED_EVENT,
    ),
  );
}
