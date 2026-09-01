"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "clases", labelKey: "clases" as const },
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
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-hielo/15 bg-white/80 px-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-hielo transition hover:border-hielo/30 hover:bg-white hover:text-accent sm:h-10 sm:min-w-10 sm:px-3 sm:text-xs ${className}`}
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hielo/12 bg-white/80 text-pizarra shadow-sm transition hover:border-hielo/25 hover:bg-white hover:text-hielo lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? t("close") : t("menu")}
      onClick={onClick}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        {open ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
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

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
      <button
        type="button"
        className="site-header__overlay"
        aria-label={t("close")}
        onClick={onClose}
      />

      <nav
        id="mobile-nav"
        className="site-header__drawer"
        aria-label="Mobile"
      >
        <div className="flex items-center justify-between border-b border-hielo/8 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-hielo">{t("menu")}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-hielo/5 hover:text-hielo"
            aria-label={t("close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isPathActive(pathname, locale, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={`/${locale}/${item.href}`}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition ${
                      active
                        ? "bg-hielo/10 text-hielo"
                        : "text-pizarra hover:bg-hielo/5 hover:text-hielo"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-hielo/8 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{locale === "es" ? "Idioma" : "Language"}</span>
            <HeaderLangSwitch locale={locale} onNavigate={onClose} />
          </div>
        </div>
      </nav>
    </div>
  );
}
