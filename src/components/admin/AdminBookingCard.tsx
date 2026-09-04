"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDisciplineDisplayName, type MainDisciplineId, type ModalityId } from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { AdminDeleteLeadButton } from "@/components/admin/AdminDeleteLeadButton";
import { LeadActions } from "@/components/admin/LeadActions";
import { customerNotesFromLeadMessage } from "@/lib/lead-message";
import type { StoredBookingItem } from "@/lib/leads";

export type AdminBookingLead = {
  id: string;
  type?: string;
  status?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale?: string;
  source?: string;
  createdAt: string;
  bookingItems?: StoredBookingItem[];
  estimatedTotal?: number;
  confirmedAt?: string;
  confirmationEmailSentAt?: string;
};

function statusTone(status?: string) {
  switch (status) {
    case "confirmed":
      return "bg-hielo/10 text-hielo";
    case "cancelled":
      return "bg-accent/10 text-accent";
    case "pending":
      return "bg-oro/15 text-pizarra";
    default:
      return "bg-nieve text-muted";
  }
}

function statusLabel(status?: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Rechazada";
    default:
      return status ?? "—";
  }
}

function productTitle(productId: string, locale: string) {
  const product = getProductBySlug(productId as ProductId);
  if (!product) return productId;
  return locale === "en" ? product.titleEn : product.titleEs;
}

function formatDate(date: string, locale: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export function AdminBookingCard({
  lead,
  instructors,
}: {
  lead: AdminBookingLead;
  instructors: { slug: string; name: string }[];
}) {
  const locale = lead.locale === "en" ? "en" : "es";
  const items = lead.bookingItems ?? [];
  const customerNotes = customerNotesFromLeadMessage(lead.message);
  const [status, setStatus] = useState(lead.status);
  const [assigning, setAssigning] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setStatus(lead.status);
  }, [lead.status]);

  async function assignInstructor(itemIndex: number, instructorSlug: string) {
    setAssigning(itemIndex);
    try {
      await fetch(`/api/admin/leads/${lead.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex, instructorSlug }),
      });
      router.refresh();
    } finally {
      setAssigning(null);
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-hielo/10 bg-white shadow-[0_8px_32px_rgba(10,18,25,0.04)] sm:rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-hielo/8 bg-gradient-to-r from-frost/30 via-white to-white px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(status)}`}>
              {statusLabel(status)}
            </span>
            <span className="text-xs text-muted">
              Recibida {new Date(lead.createdAt).toLocaleString("es-ES")}
            </span>
            {lead.confirmationEmailSentAt ? (
              <span className="rounded-full bg-hielo/8 px-2 py-0.5 text-[0.65rem] font-semibold text-hielo">
                Email enviado
              </span>
            ) : null}
          </div>
          <h2 className="mt-1.5 font-display text-lg font-semibold text-pizarra sm:mt-2 sm:text-xl">{lead.name}</h2>
          <p className="mt-1 text-sm">
            <a href={`mailto:${lead.email}`} className="font-medium text-hielo hover:underline">
              {lead.email}
            </a>
            {lead.phone ? (
              <>
                <span className="text-muted"> · </span>
                <a href={`tel:${lead.phone}`} className="text-muted hover:text-hielo hover:underline">
                  {lead.phone}
                </a>
              </>
            ) : null}
          </p>
        </div>

        <div className="shrink-0 sm:text-right">
          {lead.estimatedTotal !== undefined ? (
            <p className="font-display text-xl font-semibold text-hielo sm:text-2xl">{lead.estimatedTotal} €</p>
          ) : null}
          <p className="text-xs text-muted">
            {items.length} {items.length === 1 ? "clase" : "clases"} · total estimado
          </p>
        </div>
      </div>

      <div className="space-y-3 px-3.5 py-3 sm:px-6 sm:py-4">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => {
              const discipline = getDisciplineDisplayName(
                locale,
                item.discipline as MainDisciplineId | undefined,
                item.modality as ModalityId | undefined,
              );
              return (
                <li
                  key={`${lead.id}-${item.productId}-${item.date}-${index}`}
                  className="rounded-xl border border-hielo/8 bg-nieve/70 px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-pizarra">{productTitle(item.productId, locale)}</p>
                    <p className="text-sm font-bold text-accent">{item.lineTotal} €</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(item.date, locale)} · {item.timeSlotLabel} · {item.participants}{" "}
                    {item.participants === 1 ? "persona" : "personas"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {[discipline, item.instructorName, item.notes].filter(Boolean).join(" · ") || "Sin detalles extra"}
                  </p>
                  <label className="mt-2 block text-xs font-semibold text-hielo">
                    Asignar instructor
                    <select
                      className="mt-1 w-full rounded-lg border border-hielo/15 bg-white px-2 py-1.5 text-sm font-medium text-pizarra"
                      defaultValue={item.assignedInstructorSlug || item.instructorSlug || ""}
                      disabled={assigning === index}
                      onChange={(event) => void assignInstructor(index, event.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.slug} value={instructor.slug}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-muted">{customerNotes || lead.message}</p>
        )}

        {customerNotes && items.length > 0 ? (
          <div className="rounded-xl border border-hielo/10 bg-white px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-hielo">Mensaje del cliente</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">{customerNotes}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hielo/8 px-3.5 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <p className="text-xs text-muted">ID: {lead.id}</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LeadActions
            leadId={lead.id}
            status={status ?? "pending"}
            isBooking
            onStatusChange={setStatus}
          />
          <AdminDeleteLeadButton leadId={lead.id} />
        </div>
      </div>
    </article>
  );
}
