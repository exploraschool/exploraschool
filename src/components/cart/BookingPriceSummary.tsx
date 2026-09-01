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
  compact?: boolean;
};

export function BookingPriceSummary({
  locale,
  productId,
  sessionPrice,
  datesCount,
  participants,
  compact = false,
}: BookingPriceSummaryProps) {
  if (sessionPrice === null) return null;

  const perPerson = productId ? getFlatUnitPrice(productId) : null;
  const showPerPerson = productId ? usesPerPersonPricing(productId) : false;
  const unitPrice = perPerson ? resolvePriceDisplay(perPerson) : null;
  const display = resolvePriceDisplay(sessionPrice);
  const perSession = display.discountActive ? display.finalPrice : sessionPrice;
  const total = perSession * Math.max(1, datesCount);
  const hasDates = datesCount > 0;
  const listTotal = display.listPrice * Math.max(1, datesCount);

  const selectionLabel = hasDates
    ? pickLocale(
        locale,
        `${datesCount} día(s) · ${participants} pers.`,
        `${datesCount} day(s) · ${participants} people`,
      )
    : pickLocale(locale, "Añade al menos un día", "Add at least one day");

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-oro/20 bg-oro/5 px-2.5 py-1.5">
        <div className="min-w-0">
          <p className="truncate text-[0.6875rem] font-medium leading-tight text-pizarra">
            {selectionLabel}
          </p>
          {display.discountActive && (
            <p className="truncate text-[0.625rem] leading-tight text-oro">
              {earlyBirdDiscountLabel(locale)}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right leading-none">
          {showPerPerson && unitPrice && !hasDates ? (
            <>
              {unitPrice.discountActive && (
                <p className="text-[0.625rem] text-muted line-through">{unitPrice.listPrice} €</p>
              )}
              <p className="font-display text-base font-semibold text-accent">{unitPrice.finalPrice} €</p>
            </>
          ) : (
            <>
              {display.discountActive && hasDates && (
                <p className="text-[0.625rem] text-muted line-through">{listTotal} €</p>
              )}
              {display.discountActive && !hasDates && (
                <p className="text-[0.625rem] text-muted line-through">{display.listPrice} €</p>
              )}
              <p className="font-display text-base font-semibold text-accent">
                {hasDates ? `${total} €` : `${perSession} €`}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-oro/20 bg-gradient-to-br from-oro/8 to-accent/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-wide text-oro">
            {pickLocale(locale, "Tu selección", "Your selection")}
          </p>
          <p className="mt-0.5 text-xs text-muted">{selectionLabel}</p>
          {display.discountActive && (
            <p className="mt-0.5 text-[0.625rem] font-medium text-oro">{earlyBirdDiscountLabel(locale)}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {!hasDates && (
            <p className="text-[0.625rem] text-muted">
              {showPerPerson && unitPrice
                ? pickLocale(locale, "por persona", "per person")
                : pickLocale(locale, "por sesión", "per session")}
            </p>
          )}
          {showPerPerson && unitPrice && !hasDates ? (
            <div>
              {unitPrice.discountActive ? (
                <>
                  <p className="text-xs text-muted line-through">{unitPrice.listPrice} €</p>
                  <p className="font-display text-lg font-semibold text-accent">{unitPrice.finalPrice} €</p>
                </>
              ) : (
                <p className="font-display text-lg font-semibold text-hielo">{unitPrice.finalPrice} €</p>
              )}
            </div>
          ) : display.discountActive ? (
            <div>
              <p className="text-xs text-muted line-through">{hasDates ? `${listTotal} €` : `${display.listPrice} €`}</p>
              <p className="font-display text-lg font-semibold text-accent">
                {hasDates ? `${total} €` : `${perSession} €`}
              </p>
            </div>
          ) : (
            <p className="font-display text-lg font-semibold text-hielo">
              {hasDates ? `${total} €` : `${perSession} €`}
            </p>
          )}
          {hasDates && (
            <p className="text-[0.6rem] text-muted">
              {pickLocale(locale, "IVA incl.", "VAT incl.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
