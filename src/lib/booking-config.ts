import type { ProductId } from "@/data/products";
import type { MainDisciplineId } from "@/data/disciplines";
import { isIndividualizedDiscipline } from "@/data/disciplines";
import type { PriceTable } from "@/data/prices";
import {
  CURSO_SNOW_PER_PERSON_EUR,
  SESSION_2H_AFTERNOON,
  SESSION_2H_STANDARD,
  SESSION_3H_AFTERNOON,
  SESSION_3H_MIDDAY,
  SESSION_3H_MORNING,
  SESSION_3H_SPLIT,
  SESSION_FULL_DAY,
  sessionPriceForParticipants,
} from "@/lib/lesson-pricing";

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

export type PricingProfile = "session" | "flat";

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

const SESSION_PRICES_BY_SLOT: Partial<Record<TimeSlotId, readonly number[]>> = {
  "fd-10-16": SESSION_FULL_DAY,
  "2h-10-12": SESSION_2H_STANDARD,
  "2h-12-14": SESSION_2H_STANDARD,
  "2h-14-16": SESSION_2H_AFTERNOON,
  "3h-10-13": SESSION_3H_MORNING,
  "3h-10-12-14-15": SESSION_3H_SPLIT,
  "3h-12-15": SESSION_3H_MIDDAY,
  "3h-14-17": SESSION_3H_AFTERNOON,
};

const LESSON_SLOTS: TimeSlotId[] = [
  "2h-10-12",
  "2h-12-14",
  "2h-14-16",
  "3h-10-13",
  "3h-10-12-14-15",
  "3h-12-15",
  "3h-14-17",
];

export type ProductBookingConfig = {
  profile: PricingProfile;
  slotIds: TimeSlotId[];
  defaultSlotId: TimeSlotId;
  flatPricePerPerson?: number;
  minPeople?: number;
  maxPeople?: number;
  /** Minimum calendar days to select (e.g. 2-day course). */
  minDays?: number;
  /** Maximum calendar days to select (e.g. 5-day course). */
  maxDays?: number;
  /** When true, selected days must form one consecutive block. */
  requireConsecutiveDays?: boolean;
};

export const PRODUCT_BOOKING_CONFIG: Record<ProductId, ProductBookingConfig> = {
  "full-day": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-ninos": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-tour": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-iniciacion": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "full-day-tecnico": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 1,
    maxPeople: 8,
  },
  "medio-dia": {
    profile: "session",
    slotIds: ["3h-14-17"],
    defaultSlotId: "3h-14-17",
    minPeople: 1,
    maxPeople: 8,
  },
  "curso-snow": {
    profile: "flat",
    slotIds: ["3h-10-13"],
    defaultSlotId: "3h-10-13",
    flatPricePerPerson: CURSO_SNOW_PER_PERSON_EUR,
    minPeople: 3,
    maxPeople: 8,
  },
  particular: {
    profile: "session",
    slotIds: LESSON_SLOTS,
    defaultSlotId: "2h-10-12",
    minPeople: 1,
    maxPeople: 8,
  },
  "curso-empresa": {
    profile: "session",
    slotIds: ["fd-10-16"],
    defaultSlotId: "fd-10-16",
    minPeople: 2,
    maxPeople: 8,
    minDays: 2,
    maxDays: 5,
    requireConsecutiveDays: true,
  },
  /** @deprecated Legacy cart lines — same pricing as `particular`. */
  grupal: {
    profile: "session",
    slotIds: LESSON_SLOTS,
    defaultSlotId: "3h-10-13",
    minPeople: 1,
    maxPeople: 8,
  },
};

export function getProductBookingConfig(productId: ProductId): ProductBookingConfig {
  return PRODUCT_BOOKING_CONFIG[productId];
}

export function getParticipantLimits(
  productId: ProductId,
  discipline?: MainDisciplineId,
): { minPeople: number; maxPeople: number } {
  const config = PRODUCT_BOOKING_CONFIG[productId];

  if (discipline && isIndividualizedDiscipline(discipline)) {
    return { minPeople: 1, maxPeople: 1 };
  }

  return {
    minPeople: config.minPeople ?? 1,
    maxPeople: config.maxPeople ?? 8,
  };
}

export function clampParticipantCount(
  participants: number,
  productId: ProductId,
  discipline?: MainDisciplineId,
): number {
  const { minPeople, maxPeople } = getParticipantLimits(productId, discipline);
  if (!Number.isFinite(participants)) return minPeople;
  return Math.min(maxPeople, Math.max(minPeople, Math.round(participants)));
}

export function getSlotsForProduct(productId: ProductId): TimeSlot[] {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  return config.slotIds.map((id) => TIME_SLOTS[id]);
}

export function calculateSessionPrice(
  productId: ProductId,
  participants: number,
  slotId: TimeSlotId,
): number | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  const minPeople = config.minPeople ?? 1;
  const maxPeople = config.maxPeople ?? 8;
  if (participants < minPeople || participants > maxPeople) return null;

  if (config.profile === "flat") {
    const unit = config.flatPricePerPerson ?? 0;
    return unit * participants;
  }

  const table = SESSION_PRICES_BY_SLOT[slotId];
  if (!table) return null;
  return sessionPriceForParticipants(table, participants);
}

export function getFlatUnitPrice(productId: ProductId): number | null {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  if (config.profile !== "flat") return null;
  return config.flatPricePerPerson ?? null;
}

export function usesPerPersonPricing(productId: ProductId): boolean {
  return getFlatUnitPrice(productId) !== null;
}

export function getSlotLabel(slotId: TimeSlotId, locale: string): string {
  const slot = TIME_SLOTS[slotId];
  return locale === "es" ? slot.labelEs : slot.labelEn;
}

const SEASON_TABLE_PRODUCT: Partial<Record<PriceTable["id"], ProductId>> = {
  "clases-2h": "particular",
  "clases-3h": "particular",
  "full-day": "full-day",
};

const SCHEDULE_TO_SLOT: Record<string, TimeSlotId> = {
  "10:00–12:00": "2h-10-12",
  "12:00–14:00": "2h-12-14",
  "14:00–16:00": "2h-14-16",
  "10:00–13:00": "3h-10-13",
  "10:00–12:00 y 14:00–15:00": "3h-10-12-14-15",
  "12:00–15:00": "3h-12-15",
  "14:00–17:00": "3h-14-17",
  "10:00 – 16:00": "fd-10-16",
};

export function getBookingFromSeasonRow(
  tableId: PriceTable["id"],
  schedule: string,
): { productId: ProductId; timeSlotId: TimeSlotId } | null {
  const productId = SEASON_TABLE_PRODUCT[tableId];
  const timeSlotId = SCHEDULE_TO_SLOT[schedule];
  if (!productId || !timeSlotId) return null;
  return { productId, timeSlotId };
}
