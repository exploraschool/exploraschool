import { site } from "@/data/site";

/** Google Maps embed for the official meeting point (no API key). */
export function getMeetingPointEmbedUrl(locale: string): string {
  const { latitude, longitude } = site.meetingPoint;
  const lang = locale === "en" ? "en" : "es";
  const label = encodeURIComponent(site.meetingPoint.name);
  return `https://maps.google.com/maps?q=${label}%40${latitude},${longitude}&hl=${lang}&z=17&output=embed`;
}
