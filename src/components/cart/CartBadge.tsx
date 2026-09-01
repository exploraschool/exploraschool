"use client";

import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { useTranslations } from "next-intl";

export function CartBadge() {
  const { count, isReady } = useCart();
  const t = useTranslations("cart");

  return (
    <Link
      href="/reserva"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-hielo/12 bg-white/80 text-hielo shadow-sm transition hover:border-hielo/25 hover:bg-white hover:text-accent sm:h-10 sm:w-10"
      aria-label={t("viewCart", { count })}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M6 6h15l-1.5 9h-12L6 6z" strokeLinejoin="round" />
        <path d="M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      {isReady && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-white shadow-md">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
