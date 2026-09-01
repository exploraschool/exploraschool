import type { MainDisciplineId, ModalityId } from "@/data/disciplines";
import type { ProductId } from "@/data/products";
import type { TimeSlotId } from "@/lib/booking-config";
import { calculateSessionPrice } from "@/lib/booking-config";
import { applyEarlyBirdDiscount, isEarlyBirdActive } from "@/lib/promotions";

export type CartItem = {
  id: string;
  productId: ProductId;
  discipline?: MainDisciplineId;
  modality?: ModalityId;
  instructorSlug?: string;
  instructorName?: string;
  date: string;
  timeSlotId: TimeSlotId;
  timeSlotLabel: string;
  participants: number;
  listUnitPrice?: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
};

export type CustomerDetails = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
};

export const CART_STORAGE_KEY = "explora_cart_v2";

export function createCartItemId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMinBookingDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]!;
}

export function getMaxBookingDate(): string {
  const today = new Date();
  const year = today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
  return `${year}-05-31`;
}

export function estimateItemPrice(item: CartItem): number {
  return item.lineTotal;
}

export function estimateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

export function buildCartItem(
  input: Omit<CartItem, "id" | "unitPrice" | "lineTotal"> & { locale: string },
): CartItem | null {
  const listUnitPrice = calculateSessionPrice(input.productId, input.participants, input.timeSlotId);
  if (listUnitPrice === null) return null;

  const discountActive = isEarlyBirdActive();
  const unitPrice = applyEarlyBirdDiscount(listUnitPrice);

  return {
    ...input,
    id: createCartItemId(),
    listUnitPrice: discountActive ? listUnitPrice : undefined,
    unitPrice,
    lineTotal: unitPrice,
  };
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("explora_cart_v1");
      if (legacy) return [];
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((i) => i.timeSlotId && i.lineTotal) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function formatCartDate(date: string, locale: string): string {
  try {
    return new Date(date + "T12:00:00").toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return date;
  }
}
