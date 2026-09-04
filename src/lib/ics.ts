import { TIME_SLOTS, type TimeSlotId } from "@/lib/booking-config";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function icsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function slotStartHour(slotId: string): { start: number; hours: number } {
  const slot = TIME_SLOTS[slotId as TimeSlotId];
  if (slotId.startsWith("fd")) return { start: 10, hours: slot?.hours ?? 6 };
  if (slotId.includes("14-16") || slotId.includes("14-17")) return { start: 14, hours: slot?.hours ?? 2 };
  if (slotId.includes("12-14") || slotId.includes("12-15")) return { start: 12, hours: slot?.hours ?? 2 };
  if (slotId.includes("10-")) return { start: 10, hours: slot?.hours ?? 2 };
  return { start: 10, hours: slot?.hours ?? 2 };
}

export function buildLessonIcs(params: {
  title: string;
  date: string;
  timeSlotId: string;
  location: string;
  description: string;
}): string {
  const { start, hours } = slotStartHour(params.timeSlotId);
  const [year, month, day] = params.date.split("-").map(Number);
  const begin = new Date(year, (month || 1) - 1, day || 1, start, 0, 0);
  const end = new Date(begin.getTime() + hours * 60 * 60 * 1000);
  const stamp = icsUtc(new Date());
  const uid = `${params.date}-${params.timeSlotId}@explora-school.es`;

  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Explora School//Area alumno//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsUtc(begin)}`,
    `DTEND:${icsUtc(end)}`,
    `SUMMARY:${escape(params.title)}`,
    `LOCATION:${escape(params.location)}`,
    `DESCRIPTION:${escape(params.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
