"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";

const navItems = [
  { href: "clases", labelEs: "Clases", labelEn: "Lessons" },
  { href: "equipo", labelEs: "Equipo", labelEn: "Team" },
  { href: "blog", labelEs: "Blog", labelEn: "Blog" },
  { href: "preguntas-frecuentes", labelEs: "FAQs", labelEn: "FAQs" },
  { href: "contacto", labelEs: "Contacto", labelEn: "Contact" },
];

type HeaderNavProps = {
  locale: string;
};

export function HeaderNav({ locale }: HeaderNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const switchLocale = locale === "es" ? "en" : "es";
  const pathWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-hielo/10 text-hielo" : "text-pizarra/80 hover:bg-hielo/5 hover:text-hielo"
              }`}
            >
              {locale === "es" ? item.labelEs : item.labelEn}
            </Link>
          );
        })}
        <Link
          href={`/${switchLocale}${pathWithoutLocale}`}
          className="ml-2 rounded-full border border-hielo/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-hielo hover:border-hielo/30"
        >
          {switchLocale.toUpperCase()}
        </Link>
      </nav>

      <button
        type="button"
        className="inline-flex rounded-lg p-2 text-pizarra lg:hidden"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen(!open)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          className="absolute left-0 right-0 top-full border-t border-hielo/10 bg-nieve px-4 py-4 shadow-lg lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}/${item.href}`}
                className="rounded-lg px-3 py-3 text-base font-medium text-pizarra hover:bg-hielo/5"
                onClick={() => setOpen(false)}
              >
                {locale === "es" ? item.labelEs : item.labelEn}
              </Link>
            ))}
            <Link
              href={`/${switchLocale}${pathWithoutLocale}`}
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
              WhatsApp
            </a>
          </div>
        </nav>
      )}
    </>
  );
}
