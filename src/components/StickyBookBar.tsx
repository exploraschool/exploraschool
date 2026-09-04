"use client";

import { useEffect, useRef } from "react";
import { BookingBarCTA } from "@/components/cart/BookingBarCTA";
import { useStickyReveal } from "@/hooks/useStickyReveal";
import { pickLocale } from "@/lib/locale";

const BAR_HEIGHT_VAR = "--sticky-book-bar-h";

type StickyBookBarProps = {
  locale: string;
};

function clearBarHeight() {
  document.documentElement.style.removeProperty(BAR_HEIGHT_VAR);
}

export function StickyBookBar({ locale }: StickyBookBarProps) {
  const visible = useStickyReveal();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) {
      clearBarHeight();
      return;
    }

    const el = barRef.current;
    if (!el) return;

    function sync() {
      const node = barRef.current;
      if (!node) return;
      const hidden = window.getComputedStyle(node).display === "none";
      document.documentElement.style.setProperty(
        BAR_HEIGHT_VAR,
        hidden ? "0px" : `${node.offsetHeight}px`,
      );
    }

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      clearBarHeight();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      data-sticky-book-bar
      className="fixed inset-x-0 bottom-0 z-40 max-w-full border-t border-hielo/10 bg-white py-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(10,18,25,0.1)] md:hidden"
      role="region"
      aria-label={pickLocale(locale, "Reserva rápida", "Quick booking")}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-pizarra">
            {pickLocale(locale, "¿Listo para la nieve?", "Ready for the snow?")}
          </p>
          <p className="truncate text-[0.65rem] text-muted">
            {pickLocale(locale, "Sin pago online · Confirmación por email", "No online payment · Email confirmation")}
          </p>
        </div>
        <BookingBarCTA locale={locale} className="px-5 py-2.5 text-sm" />
      </div>
    </div>
  );
}
