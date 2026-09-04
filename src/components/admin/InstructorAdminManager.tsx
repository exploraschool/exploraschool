"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredInstructor } from "@/lib/instructors-db";
import { mainDisciplines, modalities, type DisciplineId } from "@/data/disciplines";

const ALL_DISCIPLINES: { id: DisciplineId; name: string }[] = [
  ...mainDisciplines.map((item) => ({ id: item.id, name: item.nameEs })),
  ...modalities.map((item) => ({ id: item.id, name: item.nameEs })),
];

type InstructoresTab = "equipo" | "nuevo";

export function InstructorAdminManager({ instructors }: { instructors: StoredInstructor[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<InstructoresTab>("equipo");
  const [name, setName] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [disciplines, setDisciplines] = useState<DisciplineId[]>(["esqui"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggleDiscipline(id: DisciplineId) {
    setDisciplines((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function createInstructor() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bioEs, bioEn, disciplines, languages: ["es", "en"], active: true }),
      });
      if (!res.ok) throw new Error("No se pudo crear");
      setName("");
      setBioEs("");
      setBioEn("");
      setTab("equipo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function patch(slug: string, body: Record<string, unknown>) {
    await fetch("/api/admin/instructors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, ...body }),
    });
    router.refresh();
  }

  async function remove(slug: string) {
    if (!confirm("¿Eliminar este instructor de la base de datos?")) return;
    await fetch(`/api/admin/instructors?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    router.refresh();
  }

  async function uploadPhoto(slug: string, file: File) {
    const form = new FormData();
    form.set("slug", slug);
    form.set("file", file);
    await fetch("/api/admin/instructors", { method: "POST", body: form });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Monitores">
        {(
          [
            ["equipo", "Equipo"],
            ["nuevo", "Nuevo instructor"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`instructores-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`instructores-panel-${id}`}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === id
                ? "bg-hielo text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
                : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "nuevo" ? (
        <section
          id="instructores-panel-nuevo"
          role="tabpanel"
          aria-labelledby="instructores-tab-nuevo"
          className="rounded-2xl border border-hielo/10 bg-white p-5"
        >
          <h2 className="font-display text-xl font-semibold">Nuevo instructor</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre"
              className="rounded-xl border border-hielo/15 px-3 py-2"
            />
            <textarea
              value={bioEs}
              onChange={(event) => setBioEs(event.target.value)}
              placeholder="Bio (ES)"
              className="rounded-xl border border-hielo/15 px-3 py-2"
              rows={3}
            />
            <textarea
              value={bioEn}
              onChange={(event) => setBioEn(event.target.value)}
              placeholder="Bio (EN)"
              className="rounded-xl border border-hielo/15 px-3 py-2"
              rows={3}
            />
            <div className="flex flex-wrap gap-2">
              {ALL_DISCIPLINES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDiscipline(item.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    disciplines.includes(item.id) ? "bg-hielo text-white" : "bg-nieve"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <button
              type="button"
              disabled={busy || name.trim().length < 2}
              onClick={() => void createInstructor()}
              className="btn-primary"
            >
              {busy ? "Creando…" : "Crear"}
            </button>
          </div>
        </section>
      ) : (
        <div id="instructores-panel-equipo" role="tabpanel" aria-labelledby="instructores-tab-equipo">
          {instructors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-5 py-10 text-center">
              <p className="text-sm text-muted">Todavía no hay monitores en la base de datos.</p>
              <button
                type="button"
                onClick={() => setTab("nuevo")}
                className="mt-4 text-sm font-semibold text-hielo"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {instructors.map((instructor) => (
                <li key={instructor.slug} className="rounded-2xl border border-hielo/10 bg-white p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-nieve">
                      <img src={instructor.photo} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold">{instructor.name}</p>
                      <p className="text-xs text-muted">{instructor.slug} · {instructor.disciplines.join(", ")}</p>
                      <p className="mt-2 text-sm text-muted">{instructor.bioEs}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full border px-3 py-1 text-xs font-semibold"
                          onClick={() => void patch(instructor.slug, { active: !instructor.active })}
                        >
                          {instructor.active ? "Desactivar" : "Activar"}
                        </button>
                        <label className="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold">
                          Cambiar foto
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void uploadPhoto(instructor.slug, file);
                            }}
                          />
                        </label>
                        <button type="button" className="text-xs font-semibold text-accent" onClick={() => void remove(instructor.slug)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
