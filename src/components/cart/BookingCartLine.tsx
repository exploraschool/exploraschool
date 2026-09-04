"use client";

import type { ReactNode } from "react";
import { getDisciplineDisplayName } from "@/data/disciplines";
import { getProductBySlug } from "@/data/products";
import type { CartItem } from "@/lib/cart";
import { formatCartDate } from "@/lib/cart";
import { pickLocale } from "@/lib/locale";

type BookingCartLineProps = {
  item: CartItem;
  index: number;
  locale: string;
  itemLabel: string;
  peopleLabel: string;
  removeLabel: string;
  missingDisciplineLabel?: string;
  onRemove: () => void;
};

function MetaRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-hielo/8 text-hielo">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function BookingCartLine({
  item,
  index,
  locale,
  itemLabel,
  peopleLabel,
  removeLabel,
  missingDisciplineLabel,
  onRemove,
}: BookingCartLineProps) {
  const product = getProductBySlug(item.productId);
  const discLabel = getDisciplineDisplayName(locale, item.discipline, item.modality);

  return (
    <article className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
      <div className="flex items-start justify-between gap-4 border-b border-hielo/8 bg-nieve/50 px-3.5 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-oro">
            {itemLabel} {index + 1}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-semibold text-pizarra">
            {product ? pickLocale(locale, product.titleEs, product.titleEn) : item.productId}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          {item.listUnitPrice && item.listUnitPrice > item.lineTotal ? (
            <>
              <p className="text-xs text-muted line-through">{item.listUnitPrice} €</p>
              <p className="text-lg font-bold text-accent">{item.lineTotal} €</p>
            </>
          ) : (
            <p className="text-lg font-bold text-accent">{item.lineTotal} €</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-3.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <ul className="space-y-2">
          <MetaRow
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            }
          >
            {formatCartDate(item.date, locale)}
          </MetaRow>
          <MetaRow
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          >
            {item.timeSlotLabel}
          </MetaRow>
          <MetaRow
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            }
          >
            {item.participants} {peopleLabel}
          </MetaRow>
          {discLabel ? (
            <MetaRow
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              }
            >
              {discLabel}
            </MetaRow>
          ) : missingDisciplineLabel ? (
            <li className="text-sm font-medium text-accent">{missingDisciplineLabel}</li>
          ) : null}
          {item.instructorName && (
            <MetaRow
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              }
            >
              {item.instructorName}
            </MetaRow>
          )}
          {item.notes && (
            <MetaRow
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              }
            >
              {item.notes}
            </MetaRow>
          )}
        </ul>
        <button
          type="button"
          onClick={onRemove}
          className="self-start rounded-full border border-hielo/15 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent/30 hover:text-accent sm:self-center"
        >
          {removeLabel}
        </button>
      </div>
    </article>
  );
}
