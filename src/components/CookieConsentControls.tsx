"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  readCookieConsent,
  writeCookieConsent,
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_REJECTED_EVENT,
  type CookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsentControls() {
  const t = useTranslations("cookies");
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    setConsent(readCookieConsent());
    function sync() {
      setConsent(readCookieConsent());
    }
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, sync);
    window.addEventListener(COOKIE_CONSENT_REJECTED_EVENT, sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, sync);
      window.removeEventListener(COOKIE_CONSENT_REJECTED_EVENT, sync);
    };
  }, []);

  return (
    <div className="not-prose mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => writeCookieConsent("accepted")}
        className="rounded-full bg-accent-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark/90"
      >
        {t("accept")}
      </button>
      <button
        type="button"
        onClick={() => writeCookieConsent("rejected")}
        className="rounded-full border border-hielo/20 px-4 py-2 text-sm font-semibold text-hielo transition hover:border-hielo/40 hover:bg-nieve"
      >
        {t("reject")}
      </button>
      {consent ? (
        <p className="w-full text-sm text-muted">
          {consent === "accepted" ? t("statusAccepted") : t("statusRejected")}
        </p>
      ) : null}
    </div>
  );
}
