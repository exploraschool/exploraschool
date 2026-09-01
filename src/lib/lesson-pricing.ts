/**
 * Temporada 2026/27 — tarifas unificadas (1–8 participantes).
 *
 * Derivadas de las tablas históricas de Explora (agosto 2022), escaladas para que
 * la clase estándar de 2 h (10:00–12:00, 1 participante) = 110 € → 55 €/h.
 *
 * Factor de escala: 110 ÷ 75 (precio legado 2 h mañana, 1 pax) ≈ ×1,47
 *
 * Se conservan las proporciones originales entre franjas horarias, duraciones
 * y número de participantes. Tablas 1–4 y 5–8 fusionadas en una sola de 1–8.
 */

export const HOURLY_ANCHOR_EUR = 55;

/** Precio legado de referencia (2 h · 10:00–12:00 · 1 pax) antes del escalado. */
export const LEGACY_ANCHOR_EUR = 75;

/** Factor aplicado a todas las celdas de la tabla histórica. */
export const LEGACY_SCALE_FACTOR = 110 / LEGACY_ANCHOR_EUR;

/** Precio total de sesión por número de participantes (índice 0 = 1 persona). */
export type SessionPriceRow = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** 2 h — mañana estándar 10:00–12:00 (legado 75 € → 110 €, 55 €/h). */
export const SESSION_2H_STANDARD: SessionPriceRow = [110, 125, 139, 154, 169, 183, 198, 213];

/** 2 h — mediodía 12:00–14:00 (mismo precio que 10:00–12:00). */
export const SESSION_2H_MIDDAY: SessionPriceRow = [...SESSION_2H_STANDARD];

/** 2 h — tarde 14:00–16:00 (legado desde 65 €). */
export const SESSION_2H_AFTERNOON: SessionPriceRow = [95, 110, 125, 139, 154, 169, 183, 198];

/** 3 h — mañana 10:00–13:00 (legado desde 120 €). */
export const SESSION_3H_MORNING: SessionPriceRow = [176, 198, 220, 242, 264, 286, 308, 330];

/** 3 h — 10:00–12:00 y 14:00–15:00 (legado desde 110 €). */
export const SESSION_3H_SPLIT: SessionPriceRow = [161, 183, 205, 227, 249, 271, 293, 315];

/** 3 h — 12:00–15:00 (legado desde 110 €). */
export const SESSION_3H_MIDDAY: SessionPriceRow = [161, 183, 205, 227, 249, 271, 293, 315];

/** 3 h — tarde 14:00–17:00 (legado desde 100 €). */
export const SESSION_3H_AFTERNOON: SessionPriceRow = [147, 169, 191, 213, 235, 257, 279, 301];

/** Full Day — 5 h efectivas + 1 h comodín (legado desde 160 €). */
export const SESSION_FULL_DAY: SessionPriceRow = [235, 264, 293, 323, 352, 381, 411, 440];

/** Curso snowboard 3 h — legado 60 €/persona escalado. */
export const CURSO_SNOW_PER_PERSON_EUR = 88;

export const PEOPLE_COUNT_HEADERS_ES = [
  "1 persona",
  "2 personas",
  "3 personas",
  "4 personas",
  "5 personas",
  "6 personas",
  "7 personas",
  "8 personas",
] as const;

export const PEOPLE_COUNT_HEADERS_EN = [
  "1 person",
  "2 people",
  "3 people",
  "4 people",
  "5 people",
  "6 people",
  "7 people",
  "8 people",
] as const;

export const UNIFIED_SIZE_LABEL_ES = "1–8 participantes";
export const UNIFIED_SIZE_LABEL_EN = "1–8 participants";

export function sessionPriceForParticipants(
  prices: readonly number[],
  participants: number,
): number | null {
  if (participants < 1 || participants > 8) return null;
  return prices[participants - 1] ?? null;
}

export function hourlyRateForSession(total: number, participants: number, hours: number): number {
  if (participants < 1 || hours < 1) return 0;
  return Math.round((total / participants / hours) * 10) / 10;
}
