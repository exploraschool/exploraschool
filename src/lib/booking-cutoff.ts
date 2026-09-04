/** Bookings must be submitted at least this long before lesson start (Sierra Nevada). */
export const BOOKING_LEAD_TIME_MS = 60 * 60 * 1000;
export const BOOKING_TIME_ZONE = "Europe/Madrid";

type MadridParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function madridParts(date: Date): MadridParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** First lesson start hour for a slot id (Europe/Madrid wall clock). */
export function getSlotStartHour(slotId: string): number {
  if (slotId.startsWith("fd")) return 10;
  if (slotId.includes("14-16") || slotId.includes("14-17")) return 14;
  if (slotId.includes("12-14") || slotId.includes("12-15")) return 12;
  if (slotId.includes("10-")) return 10;
  return 10;
}

/** YYYY-MM-DD in Europe/Madrid. */
export function getMadridDateKey(now: Date = new Date()): string {
  const parts = madridParts(now);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

/**
 * Absolute instant when the lesson starts in Sierra Nevada local time.
 * Returns null if the date key is invalid.
 */
export function getLessonStartDate(dateKey: string, timeSlotId: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  const hour = getSlotStartHour(timeSlotId);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, 0, 0);
  let utcMs = desiredAsUtc;

  for (let i = 0; i < 3; i++) {
    const shown = madridParts(new Date(utcMs));
    const shownAsUtc = Date.UTC(
      shown.year,
      shown.month - 1,
      shown.day,
      shown.hour,
      shown.minute,
      shown.second,
    );
    const diff = desiredAsUtc - shownAsUtc;
    utcMs += diff;
    if (diff === 0) break;
  }

  return new Date(utcMs);
}

/** True when now is already inside the last hour before class (or later). */
export function isBookingTooLate(
  dateKey: string,
  timeSlotId: string,
  now: Date = new Date(),
): boolean {
  const start = getLessonStartDate(dateKey, timeSlotId);
  if (!start) return true;
  return now.getTime() >= start.getTime() - BOOKING_LEAD_TIME_MS;
}

export function isBookingStillOpen(
  dateKey: string,
  timeSlotId: string,
  now: Date = new Date(),
): boolean {
  return !isBookingTooLate(dateKey, timeSlotId, now);
}

export function partitionByBookingCutoff<T extends { date: string; timeSlotId: string }>(
  items: T[],
  now: Date = new Date(),
): { bookable: T[]; tooLate: T[] } {
  const bookable: T[] = [];
  const tooLate: T[] = [];
  for (const item of items) {
    if (isBookingTooLate(item.date, item.timeSlotId, now)) tooLate.push(item);
    else bookable.push(item);
  }
  return { bookable, tooLate };
}
