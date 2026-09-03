import { SESSION_2H_AFTERNOON, SESSION_2H_AFTERNOON_EARLY_BIRD_EUR } from "@/lib/lesson-pricing";

export const EARLY_BIRD_DISCOUNT_PERCENT = 10;

/** Last moment the early-bird discount applies (exclusive): 1 Nov 2026 00:00 local. */
export const EARLY_BIRD_DEADLINE = new Date(2026, 10, 1, 0, 0, 0, 0);

/** Active until 1 November 2026 — banner and discounts hidden from that date onward. */
export function isEarlyBirdActive(now = new Date()): boolean {
  return now < EARLY_BIRD_DEADLINE;
}

export function applyEarlyBirdDiscount(listPrice: number, now = new Date()): number {
  if (!isEarlyBirdActive(now)) return listPrice;
  if (listPrice === SESSION_2H_AFTERNOON[0]) return SESSION_2H_AFTERNOON_EARLY_BIRD_EUR;
  return Math.round(listPrice * (1 - EARLY_BIRD_DISCOUNT_PERCENT / 100));
}

export type PriceDisplay = {
  listPrice: number;
  finalPrice: number;
  discountActive: boolean;
  discountPercent: number;
};

export function resolvePriceDisplay(listPrice: number, now = new Date()): PriceDisplay {
  const discountActive = isEarlyBirdActive(now);
  return {
    listPrice,
    finalPrice: discountActive ? applyEarlyBirdDiscount(listPrice, now) : listPrice,
    discountActive,
    discountPercent: EARLY_BIRD_DISCOUNT_PERCENT,
  };
}

export function earlyBirdBannerCopy(locale: string): { title: string; body: string } {
  if (locale === "es") {
    return {
      title: "10% de descuento en reservas anticipadas",
      body: "Reserva antes del 1 de noviembre de 2026 y consigue un 10% de descuento en todas las clases. Precios con IVA incluido.",
    };
  }
  return {
    title: "10% off early bookings",
    body: "Book before 1 November 2026 and get 10% off all lessons. Prices include VAT.",
  };
}

export function earlyBirdDiscountLabel(locale: string): string {
  return locale === "es"
    ? `Descuento reserva anticipada (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`
    : `Early booking discount (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`;
}
