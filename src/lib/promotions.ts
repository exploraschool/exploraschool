import type { ProductId } from "@/data/products";

export const EARLY_BIRD_DISCOUNT_PERCENT = 10;

/** Last moment the early-bird discount applies (exclusive): 1 Nov 2026 00:00 local. */
export const EARLY_BIRD_DEADLINE = new Date(2026, 10, 1, 0, 0, 0, 0);

/** Active until 1 November 2026 — banner and discounts hidden from that date onward. */
export function isEarlyBirdActive(now = new Date()): boolean {
  return now < EARLY_BIRD_DEADLINE;
}

/** Whether the early-bird promo price applies for a given product. */
export function isDiscountActiveForProduct(
  _productId?: ProductId | string,
  now = new Date(),
): boolean {
  return isEarlyBirdActive(now);
}

export function applyEarlyBirdDiscount(
  listPrice: number,
  now = new Date(),
  productId?: ProductId | string,
): number {
  if (!isDiscountActiveForProduct(productId, now)) return listPrice;
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
      title: "10% de descuento por reserva anticipada",
      body: "Hasta el 1 de noviembre de 2026, en todas las clases.",
    };
  }
  return {
    title: "10% off early bookings",
    body: "Until 1 November 2026, on all lessons.",
  };
}

export function earlyBirdDiscountLabel(locale: string): string {
  return locale === "es"
    ? `Descuento reserva anticipada (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`
    : `Early booking discount (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`;
}
