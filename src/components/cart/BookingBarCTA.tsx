"use client";

import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { pickLocale } from "@/lib/locale";

type BookingBarCTAProps = {
  locale: string;
  className?: string;
};

export function BookingBarCTA({ locale, className = "" }: BookingBarCTAProps) {
  const { count, isReady } = useCart();
  const hasItems = isReady && count > 0;

  const href = hasItems ? "/reserva" : "/clases";
  const label = hasItems
    ? pickLocale(locale, `Mi reserva (${count})`, `My booking (${count})`)
    : pickLocale(locale, "Elegir clases", "Choose lessons");

  return (
    <Link href={href} className={`btn-primary shrink-0 !w-auto ${className}`.trim()}>
      {label}
    </Link>
  );
}
