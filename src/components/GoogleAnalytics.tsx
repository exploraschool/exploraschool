"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const COOKIE_KEY = "explora_cookies_accepted";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;

    if (localStorage.getItem(COOKIE_KEY)) {
      setEnabled(true);
      return;
    }

    const onAccept = () => setEnabled(true);
    window.addEventListener("explora-cookies-accepted", onAccept);
    return () => window.removeEventListener("explora-cookies-accepted", onAccept);
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
