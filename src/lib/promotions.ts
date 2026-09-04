import { SESSION_2H_AFTERNOON, SESSION_2H_AFTERNOON_EARLY_BIRD_EUR } from "@/lib/lesson-pricing";
import type { ProductId } from "@/data/products";

export const EARLY_BIRD_DISCOUNT_PERCENT = 10;

/** Last moment the early-bird discount applies (exclusive): 1 Nov 2026 00:00 local. */
export const EARLY_BIRD_DEADLINE = new Date(2026, 10, 1, 0, 0, 0, 0);

/**
 * End of ski season 2026/27 (inclusive through 31 May 2027).
 * Used for products that keep the promo all season (e.g. curso snowboard).
 */
export const SEASON_DISCOUNT_DEADLINE = new Date(2027, 4, 31, 23, 59, 59, 999);

/** Products that keep the 10% discount for the whole season, past 1 Nov. */
export const SEASON_LONG_DISCOUNT_PRODUCTS = new Set<ProductId>(["curso-snow"]);

/** Active until 1 November 2026 — banner and general discounts hidden from that date onward. */
export function isEarlyBirdActive(now = new Date()): boolean {
  return now < EARLY_BIRD_DEADLINE;
}

/** Whether the early-bird / promo price applies for a given product. */
export function isDiscountActiveForProduct(productId?: ProductId | string, now = new Date()): boolean {
  if (productId && SEASON_LONG_DISCOUNT_PRODUCTS.has(productId as ProductId)) {
    return now <= SEASON_DISCOUNT_DEADLINE;
  }
  return isEarlyBirdActive(now);
}

export function applyEarlyBirdDiscount(
  listPrice: number,
  now = new Date(),
  productId?: ProductId | string,
): number {
  if (!isDiscountActiveForProduct(productId, now)) return listPrice;
  if (listPrice === SESSION_2H_AFTERNOON[0]) return SESSION_2H_AFTERNOON_EARLY_BIRD_EUR;
  return Math.round(listPrice * (1 - EARLY_BIRD_DISCOUNT_PERCENT / 100));
}

export type PriceDisplay = {
  listPrice: number;
  finalPrice: number;
  discountActive: boolean;
  discountPercent: number;
};

export function resolvePriceDisplay(
  listPrice: number,
  now = new Date(),
  productId?: ProductId | string,
): PriceDisplay {
  const discountActive = isDiscountActiveForProduct(productId, now);
  return {
    listPrice,
    finalPrice: discountActive ? applyEarlyBirdDiscount(listPrice, now, productId) : listPrice,
    discountActive,
    discountPercent: EARLY_BIRD_DISCOUNT_PERCENT,
  };
}

export function earlyBirdBannerCopy(locale: string): { title: string; body: string } {
  if (locale === "es") {
    return {
      title: "10% de descuento en reservas anticipadas",
      body: "Reserva antes del 1 de noviembre de 2026 y consigue un 10% de descuento en todas las clases. El curso de snowboard mantiene el 10% toda la temporada. Precios con IVA incluido.",
    };
  }
  return {
    title: "10% off early bookings",
    body: "Book before 1 November 2026 and get 10% off all lessons. The snowboard course keeps 10% off all season. Prices include VAT.",
  };
}

export function earlyBirdDiscountLabel(locale: string): string {
  return locale === "es"
    ? `Descuento reserva anticipada (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`
    : `Early booking discount (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`;
}
