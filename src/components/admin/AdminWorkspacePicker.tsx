"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoredInstructor } from "@/lib/instructors-db";
import { ADMIN_WORKSPACE_EXPLORA } from "@/lib/admin-workspace-config";

type AdminWorkspacePickerProps = {
  instructors: StoredInstructor[];
  currentSlug?: string | null;
};

export function AdminWorkspacePicker({ instructors, currentSlug = null }: AdminWorkspacePickerProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function choose(slug: string, href: string) {
    setBusy(slug);
    setError("");
    try {
      const res = await fetch("/api/admin/instructor-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("No se pudo abrir el panel");
      router.push(href);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(null);
    }
  }

  const activeInstructors = instructors.filter((item) => item.active);

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <section>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-hielo">Administración</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-pizarra sm:text-2xl">Explora</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Gestión de la escuela: reservas, monitores, fichas, contactos y galería.
        </p>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void choose(ADMIN_WORKSPACE_EXPLORA, "/admin/reservas")}
          className={`mt-4 flex w-full max-w-lg items-center gap-4 rounded-2xl border p-5 text-left transition disabled:opacity-60 sm:p-6 ${
            currentSlug === ADMIN_WORKSPACE_EXPLORA
              ? "border-hielo bg-hielo/5 shadow-[0_8px_28px_rgb(45_107_100_/_0.12)]"
              : "border-hielo/15 bg-white hover:border-hielo/35"
          }`}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-hielo to-hielo-light text-lg font-bold text-white">
            EX
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-semibold text-pizarra">Panel Explora</span>
            <span className="mt-0.5 block text-sm text-muted">
              {busy === ADMIN_WORKSPACE_EXPLORA ? "Entrando…" : "Reservas, equipo y operación diaria"}
            </span>
          </span>
        </button>
      </section>

      <section>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-oro">Monitores</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-pizarra sm:text-2xl">Tu perfil de instructor</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Solo tus clases asignadas y las fichas de progreso de tus alumnos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeInstructors.map((instructor) => {
            const selected = currentSlug === instructor.slug;
            return (
              <button
                key={instructor.slug}
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void choose(instructor.slug, "/admin/evaluacion")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                  selected
                    ? "border-oro bg-oro/5 shadow-sm"
                    : "border-hielo/10 bg-white hover:border-hielo/30"
                }`}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-nieve">
                  <img src={instructor.photo} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-pizarra">{instructor.name}</p>
                  <p className="truncate text-xs text-muted">{instructor.disciplines.join(" · ")}</p>
                  {busy === instructor.slug ? <p className="text-xs text-hielo">Entrando…</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
