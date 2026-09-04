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
  updatedAt: string;
  staffTips: string;
};

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
  const [students, setStudents] = useState(initialStudents);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((student) => {
      const hay = `${student.displayName} ${student.email}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [students, q]);

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

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">Buscar alumno</span>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full max-w-md rounded-xl border border-hielo/15 bg-white px-4 py-3 text-sm"
        />
      </label>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-12 text-center text-sm text-muted">
          No hay alumnos registrados{q ? " con ese filtro" : ""}.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((student) => (
            <li
              key={student.uid}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-hielo/10 bg-white px-3 py-3 sm:px-5 sm:py-4"
            >
              <Link
                href={`/admin/alumnos/${student.uid}`}
                className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 transition hover:opacity-90"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nieve text-muted">
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
                    <p className="truncate font-display text-lg font-semibold text-pizarra">
                      {student.displayName || student.email}
                    </p>
                    <p className="truncate text-sm text-muted">{student.email}</p>
                    <p className="mt-1 text-xs text-muted">
                      {student.selfLevel ? LEVEL_LABEL[student.selfLevel] || student.selfLevel : "Sin nivel"}
                      {" · "}
                      {student.reportCount} ficha{student.reportCount === 1 ? "" : "s"}
                      {!student.profileReady ? " · Perfil incompleto" : ""}
                    </p>
                  </div>
                </div>
                <span className="hidden text-sm font-semibold text-hielo sm:inline">Abrir →</span>
              </Link>
              <button
                type="button"
                disabled={busyUid === student.uid}
                onClick={() => void removeStudent(student)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 text-accent transition hover:bg-accent/5 disabled:opacity-50"
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
