"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminDeleteLeadButtonProps = {
  leadId: string;
  label?: string;
};

export function AdminDeleteLeadButton({
  leadId,
  label = "Eliminar reserva",
}: AdminDeleteLeadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta reserva del panel? Esta acción no se puede deshacer.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo eliminar");
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Error al eliminar");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title={label}
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/25 text-accent transition hover:bg-accent/10 disabled:opacity-60"
      >
        {loading ? (
          <span className="text-xs font-bold">…</span>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2 0v13.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5V6m3 4.5v6m6-6v6"
            />
          </svg>
        )}
      </button>
      {error ? <p className="max-w-[10rem] text-right text-[0.65rem] text-accent">{error}</p> : null}
    </div>
  );
}
