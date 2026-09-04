"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { site } from "@/data/site";
import { AccountNavLink } from "@/components/cuenta/AccountNavLink";

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
  onNavigate?: () => void;
};

export function HeaderLangSwitch({ locale, onNavigate }: HeaderLangSwitchProps) {
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  return (
    <div className="inline-flex rounded-full border border-hielo/15 bg-white/80 p-0.5" role="group" aria-label="Idioma">
      {(["es", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <Link
            key={code}
            href={`/${code}${pathWithoutLocale}`}
            onClick={onNavigate}
            aria-current={active ? "true" : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-[0.7rem] font-bold uppercase tracking-wider transition ${
              active ? "bg-hielo text-white" : "text-muted hover:text-hielo"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
}

function MenuLangSwitch({ locale, onNavigate }: { locale: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  return (
    <div className="inline-flex rounded-full border border-hielo/15 bg-nieve p-0.5" role="group" aria-label="Idioma">
      {(["es", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <Link
            key={code}
            href={`/${code}${pathWithoutLocale}`}
            onClick={onNavigate}
            aria-current={active ? "true" : undefined}
            className={`inline-flex h-9 min-w-10 items-center justify-center rounded-full px-3 text-xs font-bold uppercase tracking-wider transition ${
              active ? "bg-hielo text-white" : "text-muted hover:text-hielo"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
}

type HeaderDesktopNavProps = {
  locale: string;
};

export function HeaderDesktopNav({ locale }: HeaderDesktopNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex items-center" aria-label="Main">
      {navItems.map((item) => {
        const active = isPathActive(pathname, locale, item.href);
        const isFaqs = item.labelKey === "faqs";
        return (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            className={`relative whitespace-nowrap rounded-full px-2.5 py-2 text-[0.8125rem] font-medium transition xl:px-3.5 xl:text-sm ${
              active
                ? "bg-hielo/10 text-hielo"
                : "text-pizarra hover:bg-hielo/5 hover:text-hielo"
            }`}
          >
            {isFaqs ? (
              <>
                <span className="xl:hidden">{t("faqsShort")}</span>
                <span className="hidden xl:inline">{t("faqs")}</span>
              </>
            ) : (
              t(item.labelKey)
            )}
            {active && (
              <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-accent xl:inset-x-3.5" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

type HeaderMenuButtonProps = {
  open: boolean;
  onClick: () => void;
};

export function HeaderMenuButton({ open, onClick }: HeaderMenuButtonProps) {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      className={`site-header__menu-btn lg:hidden ${open ? "is-open" : ""}`}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? t("close") : t("menu")}
      onClick={onClick}
    >
      <span className="site-header__menu-btn-bars" aria-hidden>
        <span />
        <span />
        <span />
      </span>
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
    <div className="site-header__menu">
      <div
        className="site-header__menu-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className="site-header__menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
      >
        <nav id="mobile-nav" className="site-header__menu-nav" aria-label={t("menu")}>
          <ul className="site-header__menu-list">
            {navItems.map((item) => {
              const active = isPathActive(pathname, locale, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={`/${locale}/${item.href}`}
                    onClick={onClose}
                    className={`site-header__menu-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="site-header__menu-utils">
            <Link href={`/${locale}/como-llegar`} onClick={onClose}>
              {t("comoLlegar")}
            </Link>
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              WhatsApp
            </a>
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </div>

          <div className="site-header__menu-footer">
            <Link href={`/${locale}/reserva`} onClick={onClose} className="site-header__menu-book">
              {t("reservar")}
            </Link>
            <div className="site-header__menu-footer-row">
              <AccountNavLink locale={locale} mobile onNavigate={onClose} />
              <MenuLangSwitch locale={locale} onNavigate={onClose} />
            </div>
          </div>
        </nav>
      </div>
    </div>,
    document.body,
  );
}
