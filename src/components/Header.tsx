"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import {
  HeaderDesktopNav,
  HeaderMenuButton,
  HeaderMobileMenu,
} from "@/components/HeaderNav";
import { CartBadge } from "@/components/cart/CartBadge";

type HeaderProps = {
  locale: string;
};

export function Header({ locale }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header ${scrolled ? "site-header--scrolled" : "site-header--top"}`}
    >
      <div className="container-page site-header__bar">
        <Link href="/" className="site-header__brand group">
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
            locale={locale}
            open={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          />
        </div>
      </div>

      <HeaderMobileMenu locale={locale} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
