import type { ProductId } from "@/data/products";
import type { MainDisciplineId } from "@/data/disciplines";
import { isIndividualizedDiscipline } from "@/data/disciplines";
import {
  CURSO_COLECTIVO_PER_PERSON_EUR,
  MIN_LESSON_HOURS,
  SESSION_2H_STANDARD,
  SESSION_3H_AFTERNOON,
  SESSION_3H_MORNING,
  SESSION_3H_STANDARD,
  SESSION_CLUB_EMPRESA,
  SESSION_FULL_DAY,
  sessionPriceForParticipants,
} from "@/lib/lesson-pricing";

export type TimeSlotId =
  | "fd-10-16"
  | "2h-10-12"
  | "2h-12-14"
  | "2h-14-16"
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
  "3h-10-13": {
    id: "3h-10-13",
    labelEs: "10:00 – 13:00",
    labelEn: "10:00 am – 1:00 pm",
    hours: 3,
  },
  "3h-10-12-14-15": {
    id: "3h-10-12-14-15",
    labelEs: "10:00–12:00 y 15:00–16:00",
    labelEn: "10:00 am–12:00 pm & 3:00–4:00 pm",
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

export function isTimeSlotId(id: string): id is TimeSlotId {
  return Object.prototype.hasOwnProperty.call(TIME_SLOTS, id);
}

const SESSION_PRICES_BY_SLOT: Partial<Record<TimeSlotId, readonly number[]>> = {
  "fd-10-16": SESSION_FULL_DAY,
  "2h-10-12": SESSION_2H_STANDARD,
  "2h-12-14": SESSION_2H_STANDARD,
  "2h-14-16": SESSION_2H_STANDARD,
  "3h-10-13": SESSION_3H_MORNING,
  "3h-10-12-14-15": SESSION_3H_STANDARD,
  "3h-12-15": SESSION_3H_STANDARD,
  "3h-14-17": SESSION_3H_AFTERNOON,
};

const LESSON_SLOTS: TimeSlotId[] = [
  "2h-10-12",
  "2h-12-14",
  "2h-14-16",
  "3h-12-15",
  "3h-10-12-14-15",
  "3h-10-13",
];

export type ProductBookingConfig = {
  profile: PricingProfile;
  slotIds: TimeSlotId[];
  defaultSlotId: TimeSlotId;
  flatPricePerPerson?: number;
  /** Overrides slot table (e.g. club/empresa vs Full Day). */
  sessionPrices?: readonly number[];
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
    flatPricePerPerson: CURSO_COLECTIVO_PER_PERSON_EUR,
    minPeople: 4,
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
    sessionPrices: SESSION_CLUB_EMPRESA,
    minPeople: 1,
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

const PRIVATE_LESSON_PRODUCTS = new Set<ProductId>(["particular", "grupal"]);

/** Private snowboard 10:00–13:00 is 1–3 people; 4+ is the group course. */
export const PRIVATE_SNOWBOARD_MORNING_MAX = 3;

export function isPrivateLessonProduct(productId: ProductId): boolean {
  return PRIVATE_LESSON_PRODUCTS.has(productId);
}

export function isPrivateSnowboardMorningSlot(
  productId: ProductId,
  slotId: TimeSlotId,
  discipline?: MainDisciplineId,
): boolean {
  return (
    isPrivateLessonProduct(productId) &&
    slotId === "3h-10-13" &&
    discipline === "snowboard"
  );
}

export function getParticipantLimits(
  productId: ProductId,
  discipline?: MainDisciplineId,
  slotId?: TimeSlotId,
): { minPeople: number; maxPeople: number } {
  const config = PRODUCT_BOOKING_CONFIG[productId];

  if (discipline && isIndividualizedDiscipline(discipline)) {
    return { minPeople: 1, maxPeople: 1 };
  }

  if (slotId && isPrivateSnowboardMorningSlot(productId, slotId, discipline)) {
    return { minPeople: config.minPeople ?? 1, maxPeople: PRIVATE_SNOWBOARD_MORNING_MAX };
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
  slotId?: TimeSlotId,
): number {
  const { minPeople, maxPeople } = getParticipantLimits(productId, discipline, slotId);
  if (!Number.isFinite(participants)) return minPeople;
  return Math.min(maxPeople, Math.max(minPeople, Math.round(participants)));
}

/** 10:00–13:00 is available for ski, snowboard and telemark. */
export function isSlotAllowedForDiscipline(
  _slotId: TimeSlotId,
  _discipline?: MainDisciplineId,
): boolean {
  return true;
}

/** Discipline + group-size rules for a product/slot (e.g. snowboard 10:00–13:00 max 3 as private). */
export function isSlotAllowedForBooking(
  productId: ProductId,
  slotId: TimeSlotId,
  discipline?: MainDisciplineId,
  participants?: number,
): boolean {
  if (!isSlotAllowedForDiscipline(slotId, discipline)) return false;
  if (
    isPrivateSnowboardMorningSlot(productId, slotId, discipline) &&
    participants !== undefined &&
    participants > PRIVATE_SNOWBOARD_MORNING_MAX
  ) {
    return false;
  }
  return true;
}

export function getSlotsForProduct(
  productId: ProductId,
  discipline?: MainDisciplineId,
  participants?: number,
): TimeSlot[] {
  const config = PRODUCT_BOOKING_CONFIG[productId];
  return config.slotIds
    .map((id) => TIME_SLOTS[id])
    .filter((slot) => slot.hours === 0 || slot.hours >= MIN_LESSON_HOURS)
    .filter((slot) => isSlotAllowedForBooking(productId, slot.id, discipline, participants));
}

export function calculateSessionPrice(
  productId: ProductId,
  participants: number,
  slotId: TimeSlotId,
  discipline?: MainDisciplineId,
): number | null {
  if (!isSlotAllowedForBooking(productId, slotId, discipline, participants)) return null;

  const { minPeople, maxPeople } = getParticipantLimits(productId, discipline, slotId);
  if (participants < minPeople || participants > maxPeople) return null;

  const config = PRODUCT_BOOKING_CONFIG[productId];

  if (config.profile === "flat") {
    const unit = config.flatPricePerPerson ?? 0;
    return Math.round(unit * participants);
  }

  const table = config.sessionPrices ?? SESSION_PRICES_BY_SLOT[slotId];
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

const RATE_TABLE_PRODUCT: Record<string, ProductId> = {
  "clases-2h": "particular",
  "clases-3h": "particular",
  "medio-dia": "medio-dia",
  "full-day": "full-day",
  "curso-snow": "curso-snow",
  "curso-empresa": "curso-empresa",
};

const SCHEDULE_TO_SLOT: Record<string, TimeSlotId> = {
  "10:00–12:00": "2h-10-12",
  "12:00–14:00": "2h-12-14",
  "14:00–16:00": "2h-14-16",
  "10:00–13:00": "3h-10-13",
  "10:00–12:00 y 15:00–16:00": "3h-10-12-14-15",
  "12:00–15:00": "3h-12-15",
  "14:00–17:00": "3h-14-17",
  "10:00 – 16:00": "fd-10-16",
  "10:00–16:00": "fd-10-16",
};

export function getBookingFromSeasonRow(
  tableId: string,
  schedule: string,
): { productId: ProductId; timeSlotId: TimeSlotId } | null {
  const timeSlotId = SCHEDULE_TO_SLOT[schedule];
  if (!timeSlotId) return null;

  const productId = RATE_TABLE_PRODUCT[tableId];
  if (!productId) return null;
  return { productId, timeSlotId };
}

/** Maps HeroQuickBook group values (and plain 1–8) to a concrete participant count. */
export function parseQuickBookPeople(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  if (value === "3-4") return 3;
  if (value === "5+") return 5;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 8) return undefined;
  return n;
}

export function readPeopleFromLocationSearch(): number | undefined {
  if (typeof window === "undefined") return undefined;
  return parseQuickBookPeople(new URLSearchParams(window.location.search).get("people"));
}
