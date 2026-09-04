"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_REJECTED_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;

    function sync() {
      setEnabled(readCookieConsent() === "accepted");
    }

    sync();
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, sync);
    window.addEventListener(COOKIE_CONSENT_REJECTED_EVENT, sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, sync);
      window.removeEventListener(COOKIE_CONSENT_REJECTED_EVENT, sync);
    };
  }, []);

  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
