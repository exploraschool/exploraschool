"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LeadActionsProps = {
  leadId: string;
  status: string;
  isBooking: boolean;
  onStatusChange?: (status: "confirmed" | "cancelled") => void;
};

export function LeadActions({ leadId, status, isBooking, onStatusChange }: LeadActionsProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState<"confirmed" | "cancelled" | null>(null);
  const [error, setError] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  if (!isBooking) {
    const label =
      currentStatus === "received"
        ? "Recibido"
        : currentStatus === "pending"
          ? "Pendiente"
          : currentStatus;
    return (
      <span className="inline-flex rounded-full bg-nieve px-2.5 py-1 text-xs font-semibold text-muted">
        {label}
      </span>
    );
  }

  if (currentStatus === "confirmed" || currentStatus === "cancelled") {
    if (!emailWarning && !error) return null;
    return (
      <div className="space-y-2">
        {error && <p className="text-xs text-accent">{error}</p>}
        {emailWarning && <p className="text-xs font-medium text-oro">{emailWarning}</p>}
      </div>
    );
  }

  async function updateStatus(next: "confirmed" | "cancelled") {
    setLoading(next);
    setError("");
    setEmailWarning("");

    try {
      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: next }),
      });

      const payload = (await response.json().catch(() => null)) as {
        emailSent?: boolean;
        emailError?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo actualizar");
      }

      setCurrentStatus(next);
      onStatusChange?.(next);
      router.refresh();

      if (!payload?.emailSent) {
        const actionLabel = next === "confirmed" ? "confirmada" : "rechazada";
        setEmailWarning(
          payload?.emailError
            ? `Reserva ${actionLabel}, pero el email al cliente falló: ${payload.emailError}`
            : `Reserva ${actionLabel}, pero no se envió el email al cliente. Revisa RESEND_API_KEY en Vercel.`,
        );
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Error al actualizar");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("confirmed")}
          className="rounded-full bg-hielo px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-hielo-light disabled:opacity-60"
        >
          {loading === "confirmed" ? "..." : "Confirmar"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("cancelled")}
          className="rounded-full border border-hielo/15 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent/30 hover:text-accent disabled:opacity-60"
        >
          {loading === "cancelled" ? "..." : "Rechazar"}
        </button>
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
      {emailWarning && <p className="text-xs font-medium text-oro">{emailWarning}</p>}
    </div>
  );
}
