"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

type AdminTrashButtonProps = {
  deleteUrl: string;
  label: string;
  confirmMessage: string;
  ariaLabel?: string;
};

export function AdminTrashButton({
  deleteUrl,
  label,
  confirmMessage,
  ariaLabel,
}: AdminTrashButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      router.refresh();
    } catch {
      window.alert(`No se pudo eliminar «${label}».`);
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onDelete()}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 text-accent transition hover:bg-accent/5 disabled:opacity-50"
      aria-label={ariaLabel || `Eliminar ${label}`}
      title="Eliminar"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );
}
