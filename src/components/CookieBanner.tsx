"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { readCookieConsent, writeCookieConsent } from "@/lib/cookie-consent";

function CookieIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-oro sm:h-4 sm:w-4" aria-hidden fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 5.5c.69 0 1.25.56 1.25 1.25S11.44 10 10.75 10 9.5 9.44 9.5 8.75 10.06 7.5 10.75 7.5zm4.5 0c.69 0 1.25.56 1.25 1.25S16.94 10 16.25 10 15 9.44 15 8.75 15.56 7.5 16.25 7.5zM8.5 13.5c.83.94 2.04 1.5 3.5 1.5s2.67-.56 3.5-1.5c.39-.44.39-1.11 0-1.55-.39-.44-1.03-.44-1.42 0-.5.56-1.24.9-2.08.9s-1.58-.34-2.08-.9c-.39-.44-1.03-.44-1.42 0-.39.44-.39 1.11 0 1.55z" />
    </svg>
  );
}

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!readCookieConsent()) {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  function choose(consent: "accepted" | "rejected") {
    writeCookieConsent(consent);
    setMounted(false);
    window.setTimeout(() => setVisible(false), 200);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-live="polite"
      data-cookie-banner
      className={`fixed inset-x-0 bottom-0 z-50 max-w-full border-t border-hielo/10 bg-white shadow-[0_-8px_32px_rgba(14,26,36,0.08)] transition-all duration-300 ease-out sm:inset-x-4 sm:bottom-4 sm:rounded-2xl sm:border sm:bg-white/90 sm:backdrop-blur-xl ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 sm:translate-y-4"
      }`}
    >
      <div className="container-page flex flex-col gap-2 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] sm:flex-row sm:items-center sm:gap-3 sm:py-2.5 sm:pb-2.5 md:max-w-4xl md:py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hielo/8 sm:mt-0 sm:h-7 sm:w-7">
            <CookieIcon />
          </span>
          <p id="cookie-banner-title" className="min-w-0 flex-1 text-[0.7rem] leading-snug text-muted sm:text-xs md:text-sm">
            {t("message")}{" "}
            <Link
              href="/politica-de-cookies"
              className="font-medium text-hielo underline-offset-2 hover:text-accent hover:underline"
            >
              {t("policy")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-1.5 pl-8 sm:pl-0">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-full px-3 py-1 text-[0.7rem] font-semibold text-hielo transition hover:bg-hielo/8 sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-full bg-accent-dark px-3 py-1 text-[0.7rem] font-semibold text-white shadow-sm transition hover:bg-accent-dark/90 active:scale-[0.98] sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
