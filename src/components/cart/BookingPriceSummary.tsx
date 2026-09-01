"use client";

import { pickLocale } from "@/lib/locale";
import { resolvePriceDisplay, earlyBirdDiscountLabel } from "@/lib/promotions";

import type { ProductId } from "@/data/products";
import { getFlatUnitPrice, usesPerPersonPricing } from "@/lib/booking-config";

type BookingPriceSummaryProps = {
  locale: string;
  productId?: ProductId;
  sessionPrice: number | null;
  datesCount: number;
  participants: number;
};

export function BookingPriceSummary({
  locale,
  productId,
  sessionPrice,
  datesCount,
  participants,
}: BookingPriceSummaryProps) {
  if (sessionPrice === null) return null;

  const perPerson = productId ? getFlatUnitPrice(productId) : null;
  const showPerPerson = productId ? usesPerPersonPricing(productId) : false;
  const unitPrice = perPerson ? resolvePriceDisplay(perPerson) : null;
  const display = resolvePriceDisplay(sessionPrice);
  const perSession = display.discountActive ? display.finalPrice : sessionPrice;
  const total = perSession * Math.max(1, datesCount);

  return (
    <div className="rounded-2xl border border-oro/25 bg-gradient-to-br from-oro/8 to-accent/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-oro">
            {pickLocale(locale, "Tu selección", "Your selection")}
          </p>
          <p className="mt-2 text-sm text-muted">
            {datesCount > 0
              ? pickLocale(
                  locale,
                  `${datesCount} día(s) · ${participants} persona(s)`,
                  `${datesCount} day(s) · ${participants} person(s)`,
                )
              : pickLocale(locale, "Añade al menos un día", "Add at least one day")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">
            {showPerPerson && unitPrice
              ? pickLocale(locale, "por persona", "per person")
              : pickLocale(locale, "por sesión", "per session")}
          </p>
          {showPerPerson && unitPrice ? (
            <div className="mt-1">
              {unitPrice.discountActive ? (
                <>
                  <p className="text-sm text-muted line-through">{unitPrice.listPrice} €</p>
                  <p className="font-display text-xl font-semibold text-accent">{unitPrice.finalPrice} €</p>
                </>
              ) : (
                <p className="font-display text-xl font-semibold text-hielo">{unitPrice.finalPrice} €</p>
              )}
              <p className="text-[0.65rem] text-muted">
                {pickLocale(
                  locale,
                  `Total sesión: ${perSession} € (${participants} pers.)`,
                  `Session total: ${perSession} € (${participants} people)`,
                )}
              </p>
            </div>
          ) : display.discountActive ? (
            <div className="mt-1">
              <p className="text-sm text-muted line-through">{display.listPrice} €</p>
              <p className="font-display text-xl font-semibold text-accent">{perSession} €</p>
            </div>
          ) : (
            <p className="font-display text-xl font-semibold text-hielo">{perSession} €</p>
          )}
        </div>
      </div>

      {display.discountActive && (
        <p className="mt-3 text-xs font-medium text-oro">{earlyBirdDiscountLabel(locale)}</p>
      )}

      {datesCount > 0 && (
        <div className="mt-4 flex items-end justify-between border-t border-hielo/10 pt-4">
          <p className="text-sm font-medium text-pizarra">
            {pickLocale(locale, "Total estimado", "Estimated total")}
          </p>
          <div className="text-right">
            {display.discountActive && (
              <p className="text-sm text-muted line-through">
                {display.listPrice * datesCount} €
              </p>
            )}
            <p className="font-display text-3xl font-semibold text-accent">{total} €</p>
            <p className="text-[0.65rem] text-muted">
              {pickLocale(locale, "IVA incl. · sujeto a confirmación", "VAT incl. · subject to confirmation")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
