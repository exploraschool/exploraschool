import Link from "next/link";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type AdminShellProps = {
  title: string;
  description?: string;
  active: "reservas" | "leads" | "emails" | "galeria";
  children: ReactNode;
  actions?: ReactNode;
};

const NAV = [
  { href: "/admin/reservas", id: "reservas" as const, label: "Reservas" },
  { href: "/admin/emails", id: "emails" as const, label: "Emails" },
  { href: "/admin/leads", id: "leads" as const, label: "Contactos" },
  { href: "/admin/galeria", id: "galeria" as const, label: "Galería" },
];

export function AdminShell({ title, description, active, children, actions }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-nieve">
      <header className="border-b border-hielo/10 bg-white/90 backdrop-blur-md">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-oro">Explora · Admin</p>
            <h1 className="font-display text-2xl font-semibold text-hielo sm:text-3xl">{title}</h1>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="container-page flex gap-1 pb-3" aria-label="Admin">
          {NAV.map((item) => {
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
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
      <main className="container-page py-6 sm:py-8">{children}</main>
    </div>
  );
}
