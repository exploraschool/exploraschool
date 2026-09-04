"use client";

import { useEffect, useState } from "react";
import { BrandLoader } from "@/components/BrandLoader";

const SPLASH_MIN_MS = 700;
const SPLASH_KEY = "explora_splash_seen";

export function SiteSplash() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_KEY) === "1") return;
    } catch {
      /* private mode */
    }

    setVisible(true);
    const started = Date.now();
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
      window.setTimeout(() => {
        setExiting(true);
        window.setTimeout(() => {
          setVisible(false);
          try {
            sessionStorage.setItem(SPLASH_KEY, "1");
          } catch {
            /* ignore */
          }
        }, 380);
      }, wait);
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      window.setTimeout(finish, 1600);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`brand-loader-splash ${exiting ? "brand-loader-splash--out" : ""}`}
      aria-hidden={exiting}
    >
      <BrandLoader variant="inline" />
    </div>
  );
}
