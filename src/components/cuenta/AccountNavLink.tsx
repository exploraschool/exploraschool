"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type MeResponse = {
  user: {
    displayName: string;
    photoURL: string;
    onboardingComplete: boolean;
  } | null;
};

export function AccountNavLink({ locale, mobile = false, onNavigate }: { locale: string; mobile?: boolean; onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse["user"]>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cuenta/me")
      .then((res) => res.json())
      .then((payload: MeResponse) => {
        if (!cancelled) setUser(payload.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const href = `/${locale}/cuenta`;
  const label = t("account");

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="inline-flex h-10 min-w-0 items-center gap-2 rounded-full border border-hielo/15 bg-white/80 px-3 text-sm font-semibold text-hielo transition hover:border-hielo/30"
      >
        {user?.photoURL ? (
          <Image src={user.photoURL} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <circle cx="12" cy="8" r="3.25" />
            <path d="M5.5 19.2c.9-3.2 3.4-5.2 6.5-5.2s5.6 2 6.5 5.2" strokeLinecap="round" />
          </svg>
        )}
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-hielo/15 bg-white/80 px-2.5 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-white xl:px-3"
      aria-label={label}
    >
      {user?.photoURL ? (
        <Image src={user.photoURL} alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-full object-cover" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 19.2c.9-3.2 3.4-5.2 6.5-5.2s5.6 2 6.5 5.2" strokeLinecap="round" />
        </svg>
      )}
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );
}
