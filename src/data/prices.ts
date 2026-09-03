import { CURRENT_SEASON } from "./season";
import {
  CURSO_COLECTIVO_PER_PERSON_EUR,
  PEOPLE_COUNT_HEADERS_EN,
  PEOPLE_COUNT_HEADERS_ES,
  SESSION_2H_AFTERNOON,
  SESSION_2H_STANDARD,
  SESSION_3H_AFTERNOON,
  SESSION_3H_MIDDAY,
  SESSION_3H_MORNING,
  SESSION_3H_SPLIT,
  SESSION_FULL_DAY,
  UNIFIED_SIZE_LABEL_ES,
} from "@/lib/lesson-pricing";

export type PriceSeason = typeof CURRENT_SEASON.key | "legacy-2022";

export type PriceRow = {
  schedule: string;
  prices: number[];
};

export type PriceTable = {
  id: string;
  titleEs: string;
  titleEn: string;
  season: PriceSeason;
  groupSizeLabel: string;
  headers: string[];
  rows: PriceRow[];
  noteEs?: string;
  noteEn?: string;
};

export type CurrentProductPrice = {
  id: string;
  productId: string;
  titleEs: string;
  titleEn: string;
  season: PriceSeason;
  fromPrice?: number;
  unit: "person" | "group" | "day";
  hours?: number;
  extras?: { labelEs: string; labelEn: string; value: string }[];
  featuresEs: string[];
  featuresEn: string[];
};

const unifiedHeadersEs = ["Horario", ...PEOPLE_COUNT_HEADERS_ES];
const unifiedHeadersEn = ["Schedule", ...PEOPLE_COUNT_HEADERS_EN];

/** Current offer visible on home/clases — temporada 2026/27 */
export const currentPrices: CurrentProductPrice[] = [
  {
    id: "full-day-current",
    productId: "full-day",
    titleEs: "Día completo",
    titleEn: "Full Day",
    season: CURRENT_SEASON.key,
    unit: "day",
    fromPrice: SESSION_FULL_DAY[0],
    hours: 5,
    featuresEs: [
      "5 horas de clase efectivas",
      "1 hora de descanso",
      "1 y 2 personas: mismo precio total",
      "Horario ajustado a sus necesidades",
      "Punto de encuentro personalizado",
    ],
    featuresEn: [
      "5 hours of effective lesson time",
      "1 hour break",
      "1 and 2 people: same total price",
      "Schedule tailored to your needs",
      "Personalised meeting point",
    ],
  },
  {
    id: "curso-snow-current",
    productId: "curso-snow",
    titleEs: "Curso de snowboard",
    titleEn: "Snowboard course",
    season: CURRENT_SEASON.key,
    fromPrice: CURSO_COLECTIVO_PER_PERSON_EUR,
    unit: "person",
    hours: 3,
    featuresEs: [
      "Rendimiento Asegurado",
      `${CURSO_COLECTIVO_PER_PERSON_EUR} € / persona`,
      "Mínimo 4 personas para realizar el curso",
      "Máximo 8 personas",
      "3 horas de clase efectivas",
      "Horario 10:00–13:00",
    ],
    featuresEn: [
      "Guaranteed Progress",
      `€${CURSO_COLECTIVO_PER_PERSON_EUR} / person`,
      "Minimum 4 people required to run the course",
      "Maximum 8 people",
      "3 hours of effective lesson time",
      "Schedule 10:00–13:00",
    ],
  },
];

/** Tarifas temporada 2026/27 — mismas tablas usadas por el motor de reservas */
export const seasonPriceTables: PriceTable[] = [
  {
    id: "clases-2h",
    titleEs: "CLASES DE 2 HORAS",
    titleEn: "2-HOUR LESSONS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: UNIFIED_SIZE_LABEL_ES,
    headers: unifiedHeadersEs,
    rows: [
      {
        schedule: "10:00–12:00",
        prices: [...SESSION_2H_STANDARD],
      },
      { schedule: "12:00–14:00", prices: [...SESSION_2H_STANDARD] },
      { schedule: "14:00–16:00", prices: [...SESSION_2H_AFTERNOON] },
    ],
  },
  {
    id: "clases-3h",
    titleEs: "CLASES DE 3 HORAS",
    titleEn: "3-HOUR LESSONS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: UNIFIED_SIZE_LABEL_ES,
    headers: unifiedHeadersEs,
    rows: [
      { schedule: "10:00–13:00", prices: [...SESSION_3H_MORNING] },
      { schedule: "10:00–12:00 y 14:00–15:00", prices: [...SESSION_3H_SPLIT] },
      { schedule: "12:00–15:00", prices: [...SESSION_3H_MIDDAY] },
      { schedule: "14:00–17:00", prices: [...SESSION_3H_AFTERNOON] },
    ],
  },
  {
    id: "full-day",
    titleEs: "DÍA COMPLETO",
    titleEn: "FULL DAY",
    season: CURRENT_SEASON.key,
    groupSizeLabel: UNIFIED_SIZE_LABEL_ES,
    headers: unifiedHeadersEs,
    rows: [{ schedule: "10:00 – 16:00", prices: [...SESSION_FULL_DAY] }],
  },
];

/** @deprecated Use seasonPriceTables */
export const legacyPriceTables = seasonPriceTables;

/** Legacy home product starting prices (brief §1.4B) */
export const legacyFromPrices = [
  {
    productId: "full-day",
    fromPrice: SESSION_FULL_DAY[0],
    labelEs: `Día completo — desde ${SESSION_FULL_DAY[0]} €`,
    labelEn: `Full Day — from €${SESSION_FULL_DAY[0]}`,
    descriptionEs: "5 h + 1 h comodín. Experiencia personalizada. Recogida en hotel.",
    descriptionEn: "5 h lesson + 1 h buffer. Personalised experience. Hotel pick-up.",
  },
  {
    productId: "medio-dia",
    fromPrice: SESSION_3H_AFTERNOON[0],
    labelEs: `Forfait medio día — desde ${SESSION_3H_AFTERNOON[0]} €`,
    labelEn: `Half-day lift pass lessons — from €${SESSION_3H_AFTERNOON[0]}`,
    descriptionEs: "3 h de 14:00 a 17:00.",
    descriptionEn: "3 h from 2:00 to 5:00 pm.",
  },
] as const;

export const priceNotes = {
  vatEs: "Todos los precios tienen el IVA incluido.",
  vatEn: "All prices include VAT.",
  groupTotalEs:
    "Importe total del grupo (no por persona). 1 y 2 personas pagan el mismo precio. Duración mínima: 2 horas.",
  groupTotalEn:
    "Total price for the group (not per person). 1 and 2 people pay the same price. Minimum duration: 2 hours.",
  tablesIntroEs:
    "Para clases particulares. Duración mínima 2 horas. Elige cuántas personas sois y consulta el precio según el horario.",
  tablesIntroEn:
    "For private lessons. 2-hour minimum. Select your group size and check the price for each time slot.",
};
