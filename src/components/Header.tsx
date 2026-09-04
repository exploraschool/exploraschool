"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import {
  HeaderDesktopNav,
  HeaderMenuButton,
  HeaderMobileMenu,
} from "@/components/HeaderNav";
import { CartBadge } from "@/components/cart/CartBadge";
import { AdminAccessModal } from "@/components/admin/AdminAccessModal";

const ADMIN_LOGO_TAPS = 5;
const ADMIN_LOGO_TAP_WINDOW_MS = 3500;
const ADMIN_LOGO_TAP_KEY = "explora_logo_taps";

type LogoTapState = {
  count: number;
  at: number;
};

function readLogoTaps(): LogoTapState {
  try {
    const raw = sessionStorage.getItem(ADMIN_LOGO_TAP_KEY);
    if (!raw) return { count: 0, at: 0 };
    const parsed = JSON.parse(raw) as LogoTapState;
    if (typeof parsed.count !== "number" || typeof parsed.at !== "number") {
      return { count: 0, at: 0 };
    }
    return parsed;
  } catch {
    return { count: 0, at: 0 };
  }
}

function writeLogoTaps(state: LogoTapState) {
  try {
    sessionStorage.setItem(ADMIN_LOGO_TAP_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

function clearLogoTaps() {
  try {
    sessionStorage.removeItem(ADMIN_LOGO_TAP_KEY);
  } catch {
    /* ignore */
  }
}

type HeaderProps = {
  locale: string;
};

export function Header({ locale }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    };
  }, []);

  function onBrandClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);

    const now = Date.now();
    const previous = readLogoTaps();
    const withinWindow = previous.at > 0 && now - previous.at <= ADMIN_LOGO_TAP_WINDOW_MS;
    const count = (withinWindow ? previous.count : 0) + 1;

    if (count >= ADMIN_LOGO_TAPS) {
      e.preventDefault();
      clearLogoTaps();
      setMenuOpen(false);
      setAdminOpen(true);
      return;
    }

    writeLogoTaps({ count, at: now });

    logoTapTimerRef.current = setTimeout(() => {
      clearLogoTaps();
    }, ADMIN_LOGO_TAP_WINDOW_MS);
  }

  return (
    <>
      <header
        className={`site-header ${scrolled ? "site-header--scrolled" : "site-header--top"}`}
      >
        <div className="container-page site-header__bar">
          <Link href="/" className="site-header__brand" onClick={onBrandClick}>
            <Image
              src={media.logo}
              alt="Explora School & Club"
              width={160}
              height={160}
              className="site-header__logo"
              priority
            />
            <span className="site-header__name">
              <span className="site-header__name-mobile">
                <span className="block">Explora School</span>
                <span className="block text-hielo">& Club</span>
              </span>
              <span className="site-header__name-desktop">
                Explora School <span className="text-hielo">&</span> Club
              </span>
            </span>
          </Link>

          <div className="site-header__nav">
            <HeaderDesktopNav locale={locale} />
          </div>

          <div className="site-header__actions">
            <CartBadge />
            <HeaderMenuButton
              open={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            />
          </div>
        </div>

        <HeaderMobileMenu locale={locale} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>

      <AdminAccessModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
