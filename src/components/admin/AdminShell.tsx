import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { getAdminSession } from "@/lib/admin-auth";
import { adminCopy } from "@/lib/admin-copy";
import { getAdminWorkspace, workspaceHome, type AdminWorkspace } from "@/lib/admin-workspace";
import { media } from "@/lib/media";

type AdminNavId =
  | "hoy"
  | "reservas"
  | "instructores"
  | "fichas"
  | "emails"
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

const EXPLORA_NAV = [
  { href: "/admin/reservas", id: "reservas" as const, label: "Reservas" },
  { href: "/admin/instructores", id: "instructores" as const, label: "Monitores" },
  { href: "/admin/fichas", id: "fichas" as const, label: "Fichas" },
  { href: "/admin/emails", id: "emails" as const, label: "Emails" },
  { href: "/admin/leads", id: "leads" as const, label: "Contactos" },
  { href: "/admin/galeria", id: "galeria" as const, label: "Galería" },
];

const MONITOR_NAV = [{ href: "/admin/evaluacion", id: "evaluacion" as const, label: "Mis clases" }];

function modeLabel(workspace: AdminWorkspace | null): { eyebrow: string; name: string } {
  if (!workspace) {
    return { eyebrow: "Acceso", name: "Elegir panel" };
  }
  if (workspace.kind === "explora") {
    return { eyebrow: "Administración", name: "Explora" };
  }
  return { eyebrow: "Monitor", name: workspace.name };
}

export async function AdminShell({
  title,
  description,
  active,
  children,
  actions,
}: AdminShellProps) {
  const session = await getAdminSession();
  const workspace = await getAdminWorkspace();
  const mode = modeLabel(workspace);
  const home = workspace ? workspaceHome(workspace) : "/admin/hoy";
  const nav = workspace?.kind === "explora" ? EXPLORA_NAV : workspace?.kind === "instructor" ? MONITOR_NAV : [];
  const isPicker = active === "hoy";

  return (
    <div className="min-h-screen bg-nieve">
      <header className="border-b border-hielo/10 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href={home}
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-hielo/10 bg-nieve"
              aria-label={adminCopy.panelName}
            >
              <Image
                src={media.logo}
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-[0.65rem] font-bold uppercase tracking-[0.18em] ${
                    workspace?.kind === "instructor" ? "text-oro" : "text-hielo"
                  }`}
                >
                  {mode.eyebrow} · {mode.name}
                </p>
                {!isPicker ? (
                  <Link
                    href="/admin/hoy"
                    className="rounded-full border border-hielo/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-muted transition hover:border-hielo/30 hover:text-hielo"
                  >
                    Cambiar
                  </Link>
                ) : null}
              </div>
              <h1 className="font-display text-2xl font-semibold text-hielo sm:text-3xl">{title}</h1>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

        {!isPicker && nav.length > 0 ? (
          <nav className="container-page flex flex-wrap gap-1 pb-3" aria-label="Admin">
            {nav.map((item) => {
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? workspace?.kind === "instructor"
                        ? "bg-gradient-to-r from-oro to-hielo-light text-white shadow-[0_4px_14px_rgb(90_158_148_/_0.28)]"
                        : "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
                      : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>
      <main className="container-page py-6 sm:py-8">{children}</main>
    </div>
  );
}
