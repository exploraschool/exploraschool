/**
 * Temporada 2026/27 — tarifas finales (totales de grupo 1PAX–8PAX).
 *
 * Clases particulares: duración mínima 2 horas. No hay clases de 1 h.
 * 3 h 10:00–13:00 lleva un suplemento de 40 € sobre el resto de franjas de 3 h.
 *
 * Cursos de 2–5 días: 195 € (1 persona) + 25 € por cada persona extra.
 */

export const MIN_LESSON_HOURS = 2;

/** Precio 2 h (1 pax). Equivale a 55 €/h de grupo. */
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

function incrementFromBase(base: number, extraPerPerson: number): SessionPriceRow {
  return [
    base,
    base + extraPerPerson,
    base + extraPerPerson * 2,
    base + extraPerPerson * 3,
    base + extraPerPerson * 4,
    base + extraPerPerson * 5,
    base + extraPerPerson * 6,
    base + extraPerPerson * 7,
  ];
}

/** 2 h — mismo total en todas las franjas (10:00–12:00, 12:00–14:00, 14:00–16:00). */
export const SESSION_2H_STANDARD: SessionPriceRow = incrementFromBase(110, 20);

/** @deprecated Same as SESSION_2H_STANDARD */
export const SESSION_2H_MIDDAY: SessionPriceRow = SESSION_2H_STANDARD;

/** @deprecated Same as SESSION_2H_STANDARD */
export const SESSION_2H_AFTERNOON: SessionPriceRow = SESSION_2H_STANDARD;

/** 3 h 12:00–15:00 y split 10:00–12:00 / 15:00–16:00. */
export const SESSION_3H_STANDARD: SessionPriceRow = incrementFromBase(165, 30);

/** Suplemento de la franja 10:00–13:00 sobre el resto de 3 h. */
export const SESSION_3H_MORNING_SURCHARGE_EUR = 40;

/** 3 h mañana 10:00–13:00 (esquí, snowboard y telemark). */
export const SESSION_3H_MORNING: SessionPriceRow = incrementFromBase(
  SESSION_3H_STANDARD[0] + SESSION_3H_MORNING_SURCHARGE_EUR,
  30,
);

/** 3 h split 10:00–12:00 y 15:00–16:00. */
export const SESSION_3H_SPLIT: SessionPriceRow = SESSION_3H_STANDARD;

/** 3 h 12:00–15:00. */
export const SESSION_3H_MIDDAY: SessionPriceRow = SESSION_3H_STANDARD;

/** 3 h medio día 14:00–17:00 (producto forfait medio día). */
export const SESSION_3H_AFTERNOON: SessionPriceRow = SESSION_3H_STANDARD;

/** Full Day 10:00–16:00. */
export const SESSION_FULL_DAY: SessionPriceRow = incrementFromBase(250, 25);

/** Horas de clase efectivas del Full Day (el comodín no entra en el €/h). */
export const FULL_DAY_EFFECTIVE_HOURS = 5;

/** Gancho de captación: 250 € / 5 h = 50 €/h (1 persona). */
export const FULL_DAY_HOURLY_EUR = Math.round(SESSION_FULL_DAY[0] / FULL_DAY_EFFECTIVE_HOURS);

/** Cursos club/empresa (2–5 días): 195 €/día (1 persona) + 25 €/día por cada persona extra. */
export const CLUB_EMPRESA_EXTRA_EUR = 25;
export const SESSION_CLUB_EMPRESA: SessionPriceRow = incrementFromBase(195, CLUB_EMPRESA_EXTRA_EUR);

/** Curso de snowboard 3 h (10:00–13:00). Mínimo 4, máximo 8. Total de grupo desde 210 €. */
export const CURSO_COLECTIVO_MIN_PEOPLE = 4;
export const CURSO_COLECTIVO_FROM_EUR = 210;
export const CURSO_COLECTIVO_PER_PERSON_EUR = CURSO_COLECTIVO_FROM_EUR / CURSO_COLECTIVO_MIN_PEOPLE;
export const CURSO_COLECTIVO_PER_PERSON_ES = CURSO_COLECTIVO_PER_PERSON_EUR.toFixed(2).replace(".", ",");
export const CURSO_COLECTIVO_PER_PERSON_EN = CURSO_COLECTIVO_PER_PERSON_EUR.toFixed(2);

export function cursoColectivoTotal(participants: number): number | null {
  if (participants < CURSO_COLECTIVO_MIN_PEOPLE || participants > 8) return null;
  return Math.round(CURSO_COLECTIVO_PER_PERSON_EUR * participants);
}

/** Horas de clase del curso colectivo. */
export const CURSO_COLECTIVO_HOURS = 3;

/** Gancho: 52,50 € / 3 h ≈ 18 €/h por persona. */
export const CURSO_COLECTIVO_HOURLY_EUR = Math.round(
  CURSO_COLECTIVO_PER_PERSON_EUR / CURSO_COLECTIVO_HOURS,
);

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
