"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { site } from "@/data/site";
import { useState } from "react";

const navItems = [
  { href: "/clases" as const, key: "clases" },
  { href: "/equipo" as const, key: "equipo" },
  { href: "/blog" as const, key: "blog" },
  { href: "/preguntas-frecuentes" as const, key: "faqs" },
  { href: "/contacto" as const, key: "contacto" },
];

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchLocale = locale === "es" ? "en" : "es";

  return (
    <header className="sticky top-0 z-50 border-b border-hielo/10 bg-nieve/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-lg font-semibold text-pizarra md:text-xl">
            Explora
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-hielo">
            School & Club
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-hielo/10 text-hielo"
                  : "text-pizarra/80 hover:bg-hielo/5 hover:text-hielo"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={pathname}
            locale={switchLocale}
            className="hidden rounded-full border border-hielo/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-hielo hover:border-hielo/30 sm:inline-flex"
          >
            {switchLocale.toUpperCase()}
          </Link>

          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary hidden text-xs sm:inline-flex sm:px-4 sm:py-2"
          >
            {t("reservar")}
          </a>

          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-pizarra lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen(!open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-hielo/10 bg-nieve px-4 py-4 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-base font-medium text-pizarra hover:bg-hielo/5"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href={pathname}
              locale={switchLocale}
              className="rounded-lg px-3 py-3 text-base font-medium text-hielo"
              onClick={() => setOpen(false)}
            >
              {switchLocale === "es" ? "Español" : "English"}
            </Link>
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2 text-center"
            >
              {t("reservar")}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
