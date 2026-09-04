"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AdminGoogleAuthCard } from "@/components/admin/AdminGoogleAuthCard";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { adminCopy } from "@/lib/admin-copy";

type AdminAccessModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminAccessModal({ open, onClose }: AdminAccessModalProps) {
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden px-4 overscroll-none">
      <button
        type="button"
        className="absolute inset-0 bg-pizarra/55 backdrop-blur-[2px] modal-overlay"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-access-title"
        className="relative z-[1] w-full max-w-sm animate-fade-up"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-hielo/15 bg-white text-muted shadow-sm transition hover:text-hielo"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="admin-access-title" className="sr-only">
          {adminCopy.panelName}
        </h2>

        <AdminGoogleAuthCard
          consumeRedirectOnMount
          onSuccess={onClose}
          footer={
            <div className="border-t border-hielo/8 pt-3 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-hielo hover:text-accent"
              >
                Cerrar
              </button>
            </div>
          }
        />
      </div>
    </div>,
    document.body,
  );
}
