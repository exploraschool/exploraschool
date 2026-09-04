"use client";

import { useEffect, useState } from "react";

export const STICKY_REVEAL_SCROLL_Y = 480;

export function useStickyReveal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > STICKY_REVEAL_SCROLL_Y);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}
