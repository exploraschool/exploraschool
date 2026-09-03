"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { media } from "@/lib/media";
import { site } from "@/data/site";

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
    <div className="fixed inset-0 z-[120] overscroll-none lg:hidden" role="presentation">
      <button
        type="button"
        className="site-header__overlay modal-overlay"
        aria-label={t("close")}
        onClick={onClose}
      />

      <nav id="mobile-nav" className="site-header__drawer" aria-label="Mobile">
        <div className="site-header__drawer-glow" aria-hidden />

        <div className="relative border-b border-white/10 px-5 pb-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                <Image
                  src={media.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-oro-light">Sierra Nevada</p>
                <p className="font-display text-lg font-semibold leading-tight text-nieve">
                  Explora School <span className="text-frost">&</span> Club
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-nieve transition hover:border-oro-light/50 hover:bg-white/15 hover:text-oro-light"
              aria-label={t("close")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-scroll relative flex-1 px-3 py-4">
          <ul className="space-y-1.5">
            {navItems.map((item, index) => {
              const active = isPathActive(pathname, locale, item.href);
              return (
                <li
                  key={item.href}
                  className="site-header__drawer-item"
                  style={{ animationDelay: `${80 + index * 45}ms` }}
                >
                  <Link
                    href={`/${locale}/${item.href}`}
                    onClick={onClose}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition ${
                      active
                        ? "bg-gradient-to-r from-accent/90 to-accent-dark text-white shadow-[0_8px_24px_rgba(200,78,81,0.35)]"
                        : "text-nieve/90 hover:bg-white/8 hover:text-nieve"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition ${
                          active ? "bg-oro-light" : "bg-hielo-light/50 group-hover:bg-oro-light"
                        }`}
                        aria-hidden
                      />
                      {t(item.labelKey)}
                    </span>
                    <svg
                      className={`h-4 w-4 transition ${
                        active ? "text-white/80" : "text-nieve/30 group-hover:translate-x-0.5 group-hover:text-oro-light"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative space-y-3 border-t border-white/10 bg-black/20 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <Link
            href={`/${locale}/reserva`}
            onClick={onClose}
            className="btn-primary !w-full site-header__drawer-cta"
          >
            {t("reservar")}
          </Link>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-nieve/60">
              {locale === "es" ? "Idioma" : "Language"}
            </span>
            <HeaderLangSwitch
              locale={locale}
              onNavigate={onClose}
              className="!border-white/20 !bg-white/10 !text-nieve hover:!border-oro-light/40 hover:!text-oro-light"
            />
          </div>

          <a
            href={`tel:${site.phone}`}
            className="flex items-center justify-center gap-2 text-sm text-nieve/70 transition hover:text-oro-light"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>
            {site.phoneDisplay}
          </a>
        </div>
      </nav>
    </div>,
    document.body,
  );
}
