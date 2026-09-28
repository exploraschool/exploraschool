import { calculateSessionPrice, PRODUCT_BOOKING_CONFIG } from "@/lib/booking-config";
import { applyEarlyBirdDiscount, isDiscountActiveForProduct } from "@/lib/promotions";
import type { IndexableProductId } from "@/lib/seo-urls";

export type ProductOfferRange = {
  /** Price the customer pays today, matching PriceTag. */
  lowPrice: number;
  highPrice: number;
  listLowPrice: number;
  listHighPrice: number;
  discountActive: boolean;
};

/** Lowest and highest bookable group totals for an indexable lesson. */
export function getProductOfferRange(
  productId: IndexableProductId,
  now = new Date(),
): ProductOfferRange | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  const minPeople = config.minPeople ?? 1;
  const maxPeople = config.maxPeople ?? 8;
  let listLow: number | null = null;
  let listHigh: number | null = null;

  for (const slotId of config.slotIds) {
    for (let people = minPeople; people <= maxPeople; people++) {
      const price = calculateSessionPrice(productId, people, slotId);
      if (price === null) continue;
      if (listLow === null || price < listLow) listLow = price;
      if (listHigh === null || price > listHigh) listHigh = price;
    }
  }

  if (listLow === null || listHigh === null) return null;

  const discountActive = isDiscountActiveForProduct(productId, now);
  return {
    listLowPrice: listLow,
    listHighPrice: listHigh,
    lowPrice: applyEarlyBirdDiscount(listLow, now, productId),
    highPrice: applyEarlyBirdDiscount(listHigh, now, productId),
    discountActive,
  };
}
