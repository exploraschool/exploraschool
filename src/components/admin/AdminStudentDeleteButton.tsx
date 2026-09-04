"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminStudentDeleteButton({
  uid,
  label,
}: {
  uid: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        `¿Eliminar al alumno «${label}»?\nSe borrará su perfil, medias y fichas. Las reservas se conservan.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/students/${uid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      router.replace("/admin/alumnos");
      router.refresh();
    } catch {
      window.alert("No se pudo eliminar el alumno.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onDelete()}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 text-accent transition hover:bg-accent/5 disabled:opacity-50"
      aria-label={`Eliminar a ${label}`}
      title="Eliminar alumno"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 7h16" strokeLinecap="round" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
        <path d="M6.5 7 7.5 19a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7" strokeLinecap="round" />
        <path d="M10 11v5M14 11v5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
