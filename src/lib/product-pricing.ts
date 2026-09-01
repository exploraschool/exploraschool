import type { ProductId } from "@/data/products";
import { PRODUCT_BOOKING_CONFIG } from "@/lib/booking-config";
import type { TimeSlotId } from "@/lib/booking-config";
import { calculateSessionPrice } from "@/lib/booking-config";

/** Lowest session price for a product (matches booking engine). */
export function getProductFromPrice(productId: ProductId): number | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  const minPeople = config.minPeople ?? 1;

  let lowest: number | null = null;
  for (const slotId of config.slotIds) {
    const price = calculateSessionPrice(productId, minPeople, slotId);
    if (price !== null && (lowest === null || price < lowest)) {
      lowest = price;
    }
  }
  return lowest;
}

export function isBookableProduct(season: string): boolean {
  return season !== "legacy-2022";
}

export function getDefaultSlotId(productId: ProductId): TimeSlotId {
  return PRODUCT_BOOKING_CONFIG[productId].defaultSlotId;
}
