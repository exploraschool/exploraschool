"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoredInstructor } from "@/lib/instructors-db";

export function InstructorPicker({ instructors }: { instructors: StoredInstructor[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function choose(slug: string) {
    setBusy(slug);
    setError("");
    try {
      const res = await fetch("/api/admin/instructor-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("No se pudo seleccionar");
      router.push("/admin/evaluacion");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(null);
    }
  }

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-accent">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {instructors
          .filter((item) => item.active)
          .map((instructor) => (
            <button
              key={instructor.slug}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void choose(instructor.slug)}
              className="flex items-center gap-3 rounded-2xl border border-hielo/10 bg-white p-4 text-left shadow-sm transition hover:border-hielo/30 disabled:opacity-60"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-nieve">
                {/* Some instructor photos are SVG placeholders */}
                <img src={instructor.photo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-pizarra">{instructor.name}</p>
                <p className="truncate text-xs text-muted">{instructor.disciplines.join(" · ")}</p>
                {busy === instructor.slug ? <p className="text-xs text-hielo">Entrando…</p> : null}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
