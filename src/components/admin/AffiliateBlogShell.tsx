import Image from "next/image";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { media } from "@/lib/media";
import type { ReactNode } from "react";

type AffiliateBlogShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  homeHref?: string;
};

export function AffiliateBlogShell({
  title,
  description,
  children,
  actions,
  homeHref = "/admin/blog",
}: AffiliateBlogShellProps) {
  return (
    <div className="min-h-screen bg-nieve">
      <header className="sticky top-0 z-30 border-b border-hielo/10 bg-white/95 backdrop-blur-md">
        <div className="container-page flex items-center gap-2.5 py-2.5 sm:gap-3 sm:py-3.5">
          <Link
            href={homeHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hielo/10 bg-nieve sm:h-11 sm:w-11 sm:rounded-2xl"
            aria-label="Studio de blog"
          >
            <Image src={media.logo} alt="" width={36} height={36} className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-hielo sm:block">
              Studio · Afiliados Amazon
            </p>
            <h1 className="truncate font-display text-[1.2rem] font-semibold leading-tight text-hielo sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 hidden truncate text-sm text-muted sm:block">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {actions}
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="container-page panel-scroller pb-2.5 sm:pb-3" aria-label="Studio">
          <Link
            href="/admin/blog"
            className="shrink-0 rounded-full bg-gradient-to-r from-hielo to-hielo-light px-3 py-1.5 text-[0.8rem] font-semibold text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)] sm:px-4 sm:py-2 sm:text-sm"
          >
            Entradas
          </Link>
        </nav>
      </header>
      <main className="container-page py-4 sm:py-8">{children}</main>
    </div>
  );
}
