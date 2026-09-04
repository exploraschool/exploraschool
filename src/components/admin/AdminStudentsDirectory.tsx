"use client";

import Link from "next/link";
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

export function AdminStudentsDirectory({ initialStudents }: { initialStudents: AdminStudentListItem[] }) {
  const [q, setQ] = useState("");

  const students = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return initialStudents;
    return initialStudents.filter((student) => {
      const hay = `${student.displayName} ${student.email}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [initialStudents, q]);

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

      {students.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-12 text-center text-sm text-muted">
          No hay alumnos registrados{q ? " con ese filtro" : ""}.
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li key={student.uid}>
              <Link
                href={`/admin/alumnos/${student.uid}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hielo/10 bg-white px-5 py-4 transition hover:border-hielo/30"
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
                <span className="text-sm font-semibold text-hielo">Abrir →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
