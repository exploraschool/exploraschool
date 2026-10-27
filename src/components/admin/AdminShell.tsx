import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { getAdminSession } from "@/lib/admin-auth";
import { adminCopy } from "@/lib/admin-copy";
import { media } from "@/lib/media";

type AdminNavId =
  | "hoy"
  | "alumnos"
  | "reservas"
  | "instructores"
  | "leads"
  | "galeria"
  | "evaluacion";

type AdminShellProps = {
  title: string;
  description?: string;
  active: AdminNavId;
  children: ReactNode;
  actions?: ReactNode;
};

/** Day-to-day first, then content & outreach. Fichas live inside each alumno. */
const NAV = [
  { href: "/admin/reservas", id: "reservas" as const, label: "Reservas" },
  { href: "/admin/alumnos", id: "alumnos" as const, label: "Alumnos" },
  { href: "/admin/instructores", id: "instructores" as const, label: "Monitores" },
  { href: "/admin/galeria", id: "galeria" as const, label: "Galería" },
  { href: "/admin/leads", id: "leads" as const, label: "Contactos" },
];

export async function AdminShell({
  title,
  description,
  active,
  children,
  actions,
}: AdminShellProps) {
  const session = await getAdminSession();
  const navActive = active === "evaluacion" ? "alumnos" : active;

  return (
    <div className="min-h-screen bg-nieve">
      <header className="sticky top-0 z-30 border-b border-hielo/10 bg-white/95 backdrop-blur-md">
        <div className="container-page flex items-center gap-2.5 py-2.5 sm:gap-3 sm:py-3.5">
          <Link
            href="/admin/reservas"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hielo/10 bg-nieve sm:h-11 sm:w-11 sm:rounded-2xl"
            aria-label={adminCopy.panelName}
          >
            <Image
              src={media.logo}
              alt=""
              width={36}
              height={36}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-hielo sm:block">
              Administración · Explora
            </p>
            <h1 className="truncate font-display text-[1.2rem] font-semibold leading-tight text-hielo sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 hidden truncate text-sm text-muted sm:block">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {session?.email ? (
              <div className="hidden rounded-full border border-hielo/10 bg-nieve px-3 py-1.5 sm:block">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  {adminCopy.loggedInAs}
                </p>
                <p className="max-w-[14rem] truncate text-xs font-medium text-pizarra">{session.email}</p>
              </div>
            ) : null}
            {actions}
            <AdminLogoutButton />
          </div>
        </div>

        <nav className="container-page panel-scroller pb-2.5 sm:pb-3" aria-label="Admin">
          {NAV.map((item) => {
            const isActive = item.id === navActive;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
                    : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="container-page py-4 sm:py-8">{children}</main>
    </div>
  );
}
