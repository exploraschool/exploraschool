"use client";

import { useEffect, useState } from "react";
import { BookingBarCTA } from "@/components/cart/BookingBarCTA";
import { pickLocale } from "@/lib/locale";

type StickyBookBarProps = {
  locale: string;
};

export function StickyBookBar({ locale }: StickyBookBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      data-sticky-book-bar
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-hielo/10 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,18,25,0.1)] md:hidden"
      role="region"
      aria-label={pickLocale(locale, "Reserva rápida", "Quick booking")}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-pizarra">
            {pickLocale(locale, "¿Listo para la nieve?", "Ready for the snow?")}
          </p>
          <p className="truncate text-[0.65rem] text-muted">
            {pickLocale(locale, "Elige clases y envía tu solicitud", "Pick lessons and send your request")}
          </p>
        </div>
        <BookingBarCTA locale={locale} className="px-5 py-2.5 text-sm" />
      </div>
    </div>
  );
}
