"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";

export function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    const storageKey = `explora-blog-view:${slug}`;

    function ping() {
      if (readCookieConsent() !== "accepted") return;
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
      void fetch("/api/blog/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        keepalive: true,
      }).catch(() => {
        sessionStorage.removeItem(storageKey);
      });
    }

    ping();
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, ping);
    return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, ping);
  }, [slug]);

  return null;
}
