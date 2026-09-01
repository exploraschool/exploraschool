import type { ProductId } from "@/data/products";

export type TimeSlotId =
  | "fd-10-16"
  | "2h-10-12"
  | "2h-12-14"
  | "2h-14-16"
  | "3h-09-12"
  | "3h-10-13"
  | "3h-10-12-14-15"
  | "3h-12-15"
  | "3h-14-17"
  | "flexible";

export type PricingProfile = "full-day" | "lesson-2h" | "lesson-3h" | "flat" | "addon";

export type TimeSlot = {
  id: TimeSlotId;
  labelEs: string;
  labelEn: string;
  hours: number;
};

export const TIME_SLOTS: Record<TimeSlotId, TimeSlot> = {
  "fd-10-16": {
    id: "fd-10-16",
    labelEs: "10:00 – 16:00",
    labelEn: "10:00 am – 4:00 pm",
    hours: 6,
  },
  "2h-10-12": {
    id: "2h-10-12",
    labelEs: "10:00 – 12:00",
    labelEn: "10:00 am – 12:00 pm",
    hours: 2,
  },
  "2h-12-14": {
    id: "2h-12-14",
    labelEs: "12:00 – 14:00",
    labelEn: "12:00 – 2:00 pm",
    hours: 2,
  },
  "2h-14-16": {
    id: "2h-14-16",
    labelEs: "14:00 – 16:00",
    labelEn: "2:00 – 4:00 pm",
    hours: 2,
  },
  "3h-09-12": {
    id: "3h-09-12",
    labelEs: "09:00 – 12:00",
    labelEn: "9:00 am – 12:00 pm",
    hours: 3,
  },
  "3h-10-13": {
    id: "3h-10-13",
    labelEs: "10:00 – 13:00",
    labelEn: "10:00 am – 1:00 pm",
    hours: 3,
  },
  "3h-10-12-14-15": {
    id: "3h-10-12-14-15",
    labelEs: "10:00–12:00 y 14:00–15:00",
    labelEn: "10:00 am–12:00 pm & 2:00–3:00 pm",
    hours: 3,
  },
  "3h-12-15": {
    id: "3h-12-15",
    labelEs: "12:00 – 15:00",
    labelEn: "12:00 – 3:00 pm",
    hours: 3,
  },
  "3h-14-17": {
    id: "3h-14-17",
    labelEs: "14:00 – 17:00",
    labelEn: "2:00 – 5:00 pm",
    hours: 3,
  },
  flexible: {
    id: "flexible",
    labelEs: "Horario flexible",
    labelEn: "Flexible schedule",
    hours: 0,
  },
};

export type ProductBookingConfig = {
  profile: PricingProfile;
  slotIds: TimeSlotId[];
  defaultSlotId: TimeSlotId;
  flatPricePerPerson?: number;
  minPeople?: number;
  maxPeople?: number;
};

export const PRODUCT_BOOKING_CONFIG: Record<ProductId, ProductBookingConfig> = {
  "full-day": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-ninos": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-tour": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-iniciacion": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-tecnico": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "medio-dia": {
    profile: "lesson-2h",
    slotIds: ["2h-12-14", "2h-14-16"],
    defaultSlotId: "2h-14-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "clase-grabada": {
    profile: "addon",
    slotIds: ["flexible"],
    defaultSlotId: "flexible",
    flatPricePerPerson: 20,
    minPeople: 1,
    maxPeople: 8,
  },
  "curso-snow": {
    profile: "flat",
    slotIds: ["3h-10-13"],
    defaultSlotId: "3h-10-13",
    flatPricePerPerson: 60,
    minPeople: 3,
    maxPeople: 6,
  },
  particular: {
    profile: "lesson-2h",
    slotIds: ["2h-10-12", "2h-12-14", "2h-14-16", "3h-10-13", "3h-12-15", "3h-14-17"],
    defaultSlotId: "2h-10-12",
    minPeople: 1,
    maxPeople: 4,
  },
  "curso-empresa": {
    profile: "full-day",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 2,
    maxPeople: 8,
  },
  grupal: {
    profile: "lesson-3h",
    slotIds: ["3h-09-12", "3h-10-13", "3h-10-12-14-15", "3h-12-15", "3h-14-17"],
    defaultSlotId: "3h-10-13",
    minPeople: 5,
    maxPeople: 8,
  },
};

/** Tarifas temporada 2026/27 — usadas por el motor de reservas */
const PRICES_FULL_DAY_1_4 = [160, 180, 200, 220];
const PRICES_FULL_DAY_5_8 = [240, 260, 280, 300];

const PRICES_2H_1_4: Record<string, number[]> = {
  "2h-10-12": [75, 85, 95, 105],
  "2h-12-14": [70, 80, 90, 100],
  "2h-14-16": [65, 75, 85, 95],
};

const PRICES_2H_5_8: Record<string, number[]> = {
  "2h-10-12": [115, 125, 135, 145],
  "2h-12-14": [110, 120, 130, 140],
  "2h-14-16": [105, 115, 125, 135],
};

const PRICES_3H_1_4: Record<string, number[]> = {
  "3h-10-13": [120, 135, 150, 165],
  "3h-10-12-14-15": [110, 125, 140, 155],
  "3h-12-15": [110, 125, 140, 155],
  "3h-14-17": [100, 115, 130, 145],
};

const PRICES_3H_5_8: Record<string, number[]> = {
  "3h-09-12": [170, 185, 200, 215],
  "3h-10-13": [180, 195, 210, 225],
  "3h-10-12-14-15": [170, 185, 200, 215],
  "3h-12-15": [170, 185, 200, 215],
  "3h-14-17": [160, 175, 190, 205],
};

function priceIndex(participants: number, tier: "1-4" | "5-8"): number {
  if (tier === "1-4") return Math.min(4, Math.max(1, participants)) - 1;
  return Math.min(8, Math.max(5, participants)) - 5;
}

function tierForParticipants(participants: number): "1-4" | "5-8" {
  return participants <= 4 ? "1-4" : "5-8";
}

export function getProductBookingConfig(productId: ProductId): ProductBookingConfig {
  return PRODUCT_BOOKING_CONFIG[productId];
}

export function getSlotsForProduct(productId: ProductId): TimeSlot[] {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  return config.slotIds.map((id) => TIME_SLOTS[id]);
}

export function resolvePricingProfile(
  productId: ProductId,
  slotId: TimeSlotId,
): PricingProfile {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  if (config.profile === "flat" || config.profile === "addon") return config.profile;
  if (config.profile === "full-day") return "full-day";
  if (slotId.startsWith("3h-")) return "lesson-3h";
  if (slotId.startsWith("2h-")) return "lesson-2h";
  return config.profile;
}

export function calculateSessionPrice(
  productId: ProductId,
  participants: number,
  slotId: TimeSlotId,
): number | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  const minPeople = config.minPeople ?? 1;
  if (participants < minPeople) return null;

  if (config.profile === "flat" || config.profile === "addon") {
    const unit = config.flatPricePerPerson ?? 0;
    return unit * participants;
  }

  const people = participants;

  const profile = resolvePricingProfile(productId, slotId);
  const tier = tierForParticipants(people);
  const idx = priceIndex(people, tier);

  if (profile === "full-day") {
    const table = tier === "1-4" ? PRICES_FULL_DAY_1_4 : PRICES_FULL_DAY_5_8;
    return table[idx] ?? null;
  }

  if (profile === "lesson-2h") {
    const table = tier === "1-4" ? PRICES_2H_1_4[slotId] : PRICES_2H_5_8[slotId];
    return table?.[idx] ?? null;
  }

  if (profile === "lesson-3h") {
    const table = tier === "1-4" ? PRICES_3H_1_4[slotId] : PRICES_3H_5_8[slotId];
    return table?.[idx] ?? null;
  }

  return null;
}

export function getFlatUnitPrice(productId: ProductId): number | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  if (config.profile !== "flat" && config.profile !== "addon") return null;
  return config.flatPricePerPerson ?? null;
}

export function usesPerPersonPricing(productId: ProductId): boolean {
  return getFlatUnitPrice(productId) !== null;
}

export function getSlotLabel(slotId: TimeSlotId, locale: string): string {
  const slot = TIME_SLOTS[slotId];
  return locale === "es" ? slot.labelEs : slot.labelEn;
}
