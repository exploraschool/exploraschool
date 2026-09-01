"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const COOKIE_KEY = "explora_cookies_accepted";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-hielo/10 bg-white p-4 pb-24 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-xl sm:border sm:pb-4"
    >
      <p className="text-sm text-muted">{t("message")}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={accept} className="btn-primary px-4 py-2 text-xs">
          {t("accept")}
        </button>
        <Link href="/politica-de-cookies" className="text-xs font-medium text-hielo hover:underline">
          {t("policy")}
        </Link>
      </div>
    </div>
  );
}
