"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const navItems = [
  { href: "clases", labelKey: "clases" as const },
  { href: "club", labelKey: "club" as const },
  { href: "blog", labelKey: "blog" as const },
  { href: "preguntas-frecuentes", labelKey: "faqs" as const },
  { href: "contacto", labelKey: "contacto" as const },
];

function isPathActive(pathname: string, locale: string, href: string) {
  const full = `/${locale}/${href}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

type HeaderLangSwitchProps = {
  locale: string;
  className?: string;
  onNavigate?: () => void;
};

export function HeaderLangSwitch({ locale, className = "", onNavigate }: HeaderLangSwitchProps) {
  const switchLocale = locale === "es" ? "en" : "es";
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  return (
    <Link
      href={`/${switchLocale}${pathWithoutLocale}`}
      onClick={onNavigate}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-hielo/30 bg-white px-3 text-xs font-bold uppercase tracking-wider text-hielo shadow-sm transition hover:border-hielo/45 hover:text-accent ${className}`}
      aria-label={switchLocale === "es" ? "Cambiar a español" : "Switch to English"}
    >
      {switchLocale.toUpperCase()}
    </Link>
  );
}

type HeaderDesktopNavProps = {
  locale: string;
};

export function HeaderDesktopNav({ locale }: HeaderDesktopNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 xl:gap-1" aria-label="Main">
      {navItems.map((item) => {
        const active = isPathActive(pathname, locale, item.href);
        return (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            className={`relative rounded-full px-3 py-2 text-sm font-medium transition xl:px-4 ${
              active
                ? "bg-hielo/10 text-hielo"
                : "text-pizarra hover:bg-hielo/5 hover:text-hielo"
            }`}
          >
            {t(item.labelKey)}
            {active && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent xl:inset-x-4" aria-hidden />
            )}
          </Link>
        );
      })}
      <HeaderLangSwitch locale={locale} className="ml-1 xl:ml-2" />
    </nav>
  );
}

type HeaderMenuButtonProps = {
  open: boolean;
  onClick: () => void;
  locale: string;
};

export function HeaderMenuButton({ open, onClick, locale }: HeaderMenuButtonProps) {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hielo/30 bg-white text-hielo shadow-[0_2px_10px_rgba(10,18,25,0.12)] transition hover:border-hielo/45 hover:bg-white hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? t("close") : t("menu")}
      onClick={onClick}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
        {open ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        )}
      </svg>
    </button>
  );
}

type HeaderMobileMenuProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
};

export function HeaderMobileMenu({ locale, open, onClose }: HeaderMobileMenuProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] overscroll-none lg:hidden" role="presentation">
      <button
        type="button"
        className="site-header__overlay modal-overlay"
        aria-label={t("close")}
        onClick={onClose}
      />

      <nav
        id="mobile-nav"
        className="site-header__drawer"
        aria-label="Mobile"
      >
        <div className="flex items-center justify-between border-b border-hielo/15 bg-white px-4 py-4">
          <p className="font-display text-base font-semibold text-pizarra">{t("menu")}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hielo/20 bg-nieve text-hielo transition hover:border-hielo/35 hover:bg-white hover:text-accent"
            aria-label={t("close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-scroll flex-1 bg-white px-3 py-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const active = isPathActive(pathname, locale, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={`/${locale}/${item.href}`}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition ${
                      active
                        ? "bg-hielo text-white shadow-sm"
                        : "text-pizarra hover:bg-nieve hover:text-hielo"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-oro" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-hielo/15 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-pizarra">
              {locale === "es" ? "Idioma" : "Language"}
            </span>
            <HeaderLangSwitch locale={locale} onNavigate={onClose} />
          </div>
        </div>
      </nav>
    </div>,
    document.body,
  );
}
