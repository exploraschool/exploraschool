export const EARLY_BIRD_DISCOUNT_PERCENT = 10;

/** Bookings made before 1 November (local time) get the early-bird discount. */
export function isEarlyBirdActive(now = new Date()): boolean {
  const deadline = new Date(now.getFullYear(), 10, 1, 0, 0, 0, 0);
  return now < deadline;
}

export function applyEarlyBirdDiscount(listPrice: number): number {
  if (!isEarlyBirdActive()) return listPrice;
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
    finalPrice: discountActive ? applyEarlyBirdDiscount(listPrice) : listPrice,
    discountActive,
    discountPercent: EARLY_BIRD_DISCOUNT_PERCENT,
  };
}

export function earlyBirdBannerCopy(locale: string): { title: string; body: string } {
  if (locale === "es") {
    return {
      title: "10% de descuento en reservas anticipadas",
      body: "Reserva antes del 1 de noviembre y consigue un 10% de descuento en todas las clases. Precios con IVA incluido.",
    };
  }
  return {
    title: "10% off early bookings",
    body: "Book before 1 November and get 10% off all lessons. Prices include VAT.",
  };
}

export function earlyBirdDiscountLabel(locale: string): string {
  return locale === "es"
    ? `Descuento reserva anticipada (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`
    : `Early booking discount (-${EARLY_BIRD_DISCOUNT_PERCENT}%)`;
}
