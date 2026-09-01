import type { Locale } from "@/i18n/routing";

export function pickLocale<T>(locale: string, es: T, en: T): T {
  return locale === "en" ? en : es;
}

export function isLocale(value: string): value is Locale {
  return value === "es" || value === "en";
}
