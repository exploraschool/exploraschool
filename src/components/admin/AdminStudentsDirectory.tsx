"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type AdminStudentListItem = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  selfLevel: string | null;
  disciplines: string[];
  profileReady: boolean;
  onboardingComplete: boolean;
  reportCount: number;
  lastReportAt?: string;
  pendingMediaCount?: number;
  hasPinnedTip?: boolean;
  tipPreview?: string;
  updatedAt: string;
  staffTips: string;
};

type QuickFilter = "all" | "tip" | "pending" | "no-report";

const LEVEL_LABEL: Record<string, string> = {
  debutante: "Debutante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
      <path d="M6.5 7 7.5 19a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7" strokeLinecap="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  );
}

export function AdminStudentsDirectory({ initialStudents }: { initialStudents: AdminStudentListItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("all");
  const [students, setStudents] = useState(initialStudents);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return students.filter((student) => {
      if (filter === "tip" && !student.hasPinnedTip && !student.staffTips?.trim()) return false;
      if (filter === "pending" && !(student.pendingMediaCount && student.pendingMediaCount > 0)) return false;
      if (filter === "no-report" && student.reportCount > 0) return false;
      if (!needle) return true;
      const hay = `${student.displayName} ${student.email}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [students, q, filter]);

  async function removeStudent(student: AdminStudentListItem) {
    const label = student.displayName || student.email;
    if (!window.confirm(`¿Eliminar al alumno «${label}»?\nSe borrará su perfil, medias y fichas. Las reservas se conservan.`)) {
      return;
    }
    setBusyUid(student.uid);
    setError("");
    try {
      const res = await fetch(`/api/admin/students/${student.uid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setStudents((current) => current.filter((item) => item.uid !== student.uid));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setBusyUid(null);
    }
  }

  const filters: { id: QuickFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "tip", label: "Con tip" },
    { id: "pending", label: "Medias pendientes" },
    { id: "no-report", label: "Sin ficha" },
  ];

  return (
    <div className="space-y-3 sm:space-y-5">
      <label className="block">
        <span className="sr-only">Buscar alumno</span>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full max-w-md rounded-xl border border-hielo/15 bg-white px-3.5 py-2.5 text-sm sm:px-4 sm:py-3"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === item.id ? "bg-hielo text-white" : "border border-hielo/15 bg-white text-pizarra"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-12 text-center text-sm text-muted">
          No hay alumnos{q || filter !== "all" ? " con ese filtro" : ""}.
        </p>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {filtered.map((student) => (
            <li
              key={student.uid}
              className="flex items-center gap-2 rounded-xl border border-hielo/10 bg-white px-2.5 py-2.5 sm:rounded-2xl sm:px-5 sm:py-4"
            >
              <Link
                href={`/admin/alumnos/${student.uid}`}
                className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 transition hover:opacity-90"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nieve text-muted sm:h-12 sm:w-12">
                    {student.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <circle cx="12" cy="8" r="3.25" />
                        <path d="M5.5 19.2c.9-3.2 3.4-5.2 6.5-5.2s5.6 2 6.5 5.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-pizarra sm:text-lg">
                      {student.displayName || student.email}
                    </p>
                    <p className="truncate text-sm text-muted">{student.email}</p>
                    <p className="mt-1 text-xs text-muted">
                      {student.selfLevel ? LEVEL_LABEL[student.selfLevel] || student.selfLevel : "Sin nivel"}
                      {" · "}
                      {student.reportCount} ficha{student.reportCount === 1 ? "" : "s"}
                      {student.lastReportAt ? ` · Última ${student.lastReportAt.slice(0, 10)}` : ""}
                      {!student.profileReady ? " · Perfil incompleto" : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {student.hasPinnedTip || student.staffTips?.trim() ? (
                        <span className="rounded-full bg-oro/15 px-2 py-0.5 text-[0.65rem] font-semibold text-hielo">
                          Tip
                          {student.tipPreview ? `: ${student.tipPreview.slice(0, 28)}${student.tipPreview.length > 28 ? "…" : ""}` : ""}
                        </span>
                      ) : null}
                      {(student.pendingMediaCount ?? 0) > 0 ? (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-semibold text-accent">
                          {student.pendingMediaCount} media{student.pendingMediaCount === 1 ? "" : "s"} pendiente
                          {student.pendingMediaCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                      {student.reportCount === 0 ? (
                        <span className="rounded-full bg-nieve px-2 py-0.5 text-[0.65rem] font-semibold text-muted">
                          Sin ficha
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <span className="hidden text-sm font-semibold text-hielo sm:inline">Abrir →</span>
              </Link>
              <button
                type="button"
                disabled={busyUid === student.uid}
                onClick={() => void removeStudent(student)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/25 text-accent transition hover:bg-accent/5 disabled:opacity-50 sm:h-10 sm:w-10"
                aria-label={`Eliminar a ${student.displayName || student.email}`}
                title="Eliminar alumno"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
