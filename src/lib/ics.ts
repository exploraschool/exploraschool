import { TIME_SLOTS, type TimeSlotId } from "@/lib/booking-config";
import { getLessonStartDate, getSlotStartHour } from "@/lib/booking-cutoff";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function icsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function buildLessonIcs(params: {
  title: string;
  date: string;
  timeSlotId: string;
  location: string;
  description: string;
}): string {
  const slot = TIME_SLOTS[params.timeSlotId as TimeSlotId];
  const hours = slot?.hours ?? 2;
  const begin =
    getLessonStartDate(params.date, params.timeSlotId) ??
    (() => {
      const [year, month, day] = params.date.split("-").map(Number);
      return new Date(year, (month || 1) - 1, day || 1, getSlotStartHour(params.timeSlotId), 0, 0);
    })();
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
