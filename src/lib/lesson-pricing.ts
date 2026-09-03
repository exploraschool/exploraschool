/**
 * Temporada 2026/27 — Tarifa Perfecta.
 *
 * Clases particulares: 1 y 2 personas pagan el mismo precio total.
 * Duración mínima: 2 horas. No hay clases de 1 h ni franja 09:00–12:00.
 *
 * Extra por persona a partir de la 3.ª (salvo 2 h tarde: tarifa plana 1–4).
 */

export const MIN_LESSON_HOURS = 2;

/** Precio 2 h mañana (1–2 pax). Equivale a 55 €/h de grupo. */
export const HOURLY_ANCHOR_EUR = 55;

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

function pairBaseRow(base: number, extraPerPerson: number): SessionPriceRow {
  return [
    base,
    base,
    base + extraPerPerson,
    base + extraPerPerson * 2,
    base + extraPerPerson * 3,
    base + extraPerPerson * 4,
    base + extraPerPerson * 5,
    base + extraPerPerson * 6,
  ];
}

/** 2 h mañana 10:00–12:00 / 12:00–14:00: 110 € (1–2) + 10 € desde la 3.ª. */
export const SESSION_2H_STANDARD: SessionPriceRow = pairBaseRow(110, 10);

/** 2 h mediodía — mismo precio que 10:00–12:00. */
export const SESSION_2H_MIDDAY: SessionPriceRow = SESSION_2H_STANDARD;

/**
 * 2 h tarde 14:00–16:00: 89 € plano de 1 a 4 personas.
 * Desde la 5.ª: 100, 110, 120, 130 €.
 */
export const SESSION_2H_AFTERNOON: SessionPriceRow = [89, 89, 89, 89, 100, 110, 120, 130];

/**
 * Early bird de la tarifa plana de 2 h tarde (89 € → 79 €).
 * Math.round(89 * 0.9) daría 80; se redondea a 79 como precio comercial.
 */
export const SESSION_2H_AFTERNOON_EARLY_BIRD_EUR = 79;

/** 3 h mañana 10:00–13:00: 150 € (1–2) + 15 € desde la 3.ª. */
export const SESSION_3H_MORNING: SessionPriceRow = pairBaseRow(150, 15);

/** 3 h split 10:00–12:00 y 14:00–15:00 — misma tarifa que mañana. */
export const SESSION_3H_SPLIT: SessionPriceRow = SESSION_3H_MORNING;

/** 3 h 12:00–15:00 — misma tarifa que mañana. */
export const SESSION_3H_MIDDAY: SessionPriceRow = SESSION_3H_MORNING;

/** 3 h medio día 14:00–17:00: 135 € (1–2) + 15 € desde la 3.ª. */
export const SESSION_3H_AFTERNOON: SessionPriceRow = pairBaseRow(135, 15);

/** Full Day 10:00–16:00: 220 € (1–2) + 25 € desde la 3.ª. */
export const SESSION_FULL_DAY: SessionPriceRow = pairBaseRow(220, 25);

/** Cursos club/empresa (2–5 días): 195 €/día (1–2) + 25 €/día desde la 3.ª. */
export const SESSION_CLUB_EMPRESA: SessionPriceRow = pairBaseRow(195, 25);

/** Curso de snowboard 3 h (10:00–13:00): 59 €/persona. Mínimo 4, máximo 8. */
export const CURSO_COLECTIVO_PER_PERSON_EUR = 59;

/** @deprecated Use CURSO_COLECTIVO_PER_PERSON_EUR */
export const CURSO_SNOW_PER_PERSON_EUR = CURSO_COLECTIVO_PER_PERSON_EUR;

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
