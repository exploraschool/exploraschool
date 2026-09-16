import { CURRENT_SEASON } from "./season";
import {
  CURSO_COLECTIVO_FROM_EUR,
  CURSO_COLECTIVO_PER_PERSON_EN,
  CURSO_COLECTIVO_PER_PERSON_ES,
  cursoColectivoTotal,
  FULL_DAY_HOURLY_EUR,
  PEOPLE_COUNT_HEADERS_EN,
  PEOPLE_COUNT_HEADERS_ES,
  SESSION_2H_STANDARD,
  SESSION_3H_AFTERNOON,
  SESSION_3H_MORNING,
  SESSION_3H_STANDARD,
  SESSION_CLUB_EMPRESA,
  SESSION_FULL_DAY,
  UNIFIED_SIZE_LABEL_ES,
} from "@/lib/lesson-pricing";

export type PriceSeason = typeof CURRENT_SEASON.key | "legacy-2022";

export type PriceRow = {
  schedule: string;
  prices: number[];
};

export type CompleteRateRow = {
  scheduleEs: string;
  scheduleEn: string;
  prices: Array<number | null>;
};

export type CompleteRateTable = {
  id: string;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  noteEs?: string;
  noteEn?: string;
  rows: CompleteRateRow[];
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
    titleEs: "Full Day",
    titleEn: "Full Day",
    season: CURRENT_SEASON.key,
    unit: "day",
    fromPrice: SESSION_FULL_DAY[0],
    hours: 5,
    featuresEs: [
      "5 horas de clase efectivas",
      "1 hora de descanso",
      "Precio total según número de personas (1–8)",
      "Horario ajustado a sus necesidades",
      "Punto de encuentro personalizado",
    ],
    featuresEn: [
      "5 hours of effective lesson time",
      "1 hour break",
      "Total price by group size (1–8)",
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
    fromPrice: CURSO_COLECTIVO_FROM_EUR,
    unit: "group",
    hours: 3,
    featuresEs: [
      "Rendimiento Asegurado",
      `Desde ${CURSO_COLECTIVO_FROM_EUR} € (4 personas)`,
      `${CURSO_COLECTIVO_PER_PERSON_ES} € / persona`,
      "Mínimo 4 personas para realizar el curso",
      "Máximo 8 personas",
      "3 horas de clase efectivas",
      "Horario 10:00–13:00",
    ],
    featuresEn: [
      "Guaranteed Progress",
      `From €${CURSO_COLECTIVO_FROM_EUR} (4 people)`,
      `€${CURSO_COLECTIVO_PER_PERSON_EN} / person`,
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
      { schedule: "14:00–16:00", prices: [...SESSION_2H_STANDARD] },
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
      { schedule: "12:00–15:00", prices: [...SESSION_3H_STANDARD] },
      { schedule: "10:00–12:00 y 15:00–16:00", prices: [...SESSION_3H_STANDARD] },
      { schedule: "10:00–13:00", prices: [...SESSION_3H_MORNING] },
    ],
  },
  {
    id: "full-day",
    titleEs: "FULL DAY",
    titleEn: "FULL DAY",
    season: CURRENT_SEASON.key,
    groupSizeLabel: UNIFIED_SIZE_LABEL_ES,
    headers: unifiedHeadersEs,
    rows: [{ schedule: "10:00 – 16:00", prices: [...SESSION_FULL_DAY] }],
  },
];

function groupPrices(row: readonly number[]): Array<number | null> {
  return [...row];
}

const cursoSnowTotals: Array<number | null> = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
  cursoColectivoTotal(n),
);

/** Cuadro oficial de tarifas (sin promociones). Precio total de grupo salvo nota. */
export const completeRateTables: CompleteRateTable[] = [
  {
    id: "clases-2h",
    titleEs: "Clases de 2 horas",
    titleEn: "2-hour lessons",
    subtitleEs: "Total del grupo",
    subtitleEn: "Group total",
    rows: [
      {
        scheduleEs: "10:00–12:00",
        scheduleEn: "10:00 am–12:00 pm",
        prices: groupPrices(SESSION_2H_STANDARD),
      },
      {
        scheduleEs: "12:00–14:00",
        scheduleEn: "12:00–2:00 pm",
        prices: groupPrices(SESSION_2H_STANDARD),
      },
      {
        scheduleEs: "14:00–16:00",
        scheduleEn: "2:00–4:00 pm",
        prices: groupPrices(SESSION_2H_STANDARD),
      },
    ],
  },
  {
    id: "clases-3h",
    titleEs: "Clases de 3 horas",
    titleEn: "3-hour lessons",
    subtitleEs: "Total del grupo",
    subtitleEn: "Group total",
    rows: [
      {
        scheduleEs: "12:00–15:00",
        scheduleEn: "12:00–3:00 pm",
        prices: groupPrices(SESSION_3H_STANDARD),
      },
      {
        scheduleEs: "10:00–12:00 y 15:00–16:00",
        scheduleEn: "10:00 am–12:00 pm & 3:00–4:00 pm",
        prices: groupPrices(SESSION_3H_STANDARD),
      },
      {
        scheduleEs: "10:00–13:00",
        scheduleEn: "10:00 am–1:00 pm",
        prices: groupPrices(SESSION_3H_MORNING),
      },
    ],
  },
  {
    id: "full-day",
    titleEs: "Full Day",
    titleEn: "Full Day",
    subtitleEs: `5 h de clase · ${FULL_DAY_HOURLY_EUR} €/h`,
    subtitleEn: `5 h lesson · €${FULL_DAY_HOURLY_EUR}/h`,
    rows: [
      {
        scheduleEs: "10:00–16:00",
        scheduleEn: "10:00 am–4:00 pm",
        prices: groupPrices(SESSION_FULL_DAY),
      },
    ],
  },
  {
    id: "curso-snow",
    titleEs: "Curso de snowboard",
    titleEn: "Snowboard course",
    subtitleEs: `Desde ${CURSO_COLECTIVO_FROM_EUR} €`,
    subtitleEn: `From €${CURSO_COLECTIVO_FROM_EUR}`,
    noteEs: "Mínimo 4 personas para confirmar el curso. Máximo 8. Horario 10:00–13:00.",
    noteEn: "Minimum 4 people to confirm the course. Maximum 8. Schedule 10:00 am–1:00 pm.",
    rows: [
      {
        scheduleEs: "10:00–13:00",
        scheduleEn: "10:00 am–1:00 pm",
        prices: cursoSnowTotals,
      },
    ],
  },
  {
    id: "curso-empresa",
    titleEs: "Cursos de 2 a 5 días",
    titleEn: "2 to 5-day courses",
    subtitleEs: "Precio por día",
    subtitleEn: "Price per day",
    rows: [
      {
        scheduleEs: "10:00–16:00",
        scheduleEn: "10:00 am–4:00 pm",
        prices: groupPrices(SESSION_CLUB_EMPRESA),
      },
    ],
  },
];

/** @deprecated Use seasonPriceTables */
export const legacyPriceTables = seasonPriceTables;

/** Legacy home product starting prices (brief §1.4B) */
export const legacyFromPrices = [
  {
    productId: "full-day",
    fromPrice: SESSION_FULL_DAY[0],
    labelEs: `Full Day — desde ${SESSION_FULL_DAY[0]} €`,
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
    "Importe total del grupo (no por persona). Duración mínima: 2 horas.",
  groupTotalEn:
    "Total price for the group (not per person). Minimum duration: 2 hours.",
  tablesIntroEs: "Para clases particulares. Duración mínima 2 horas.",
  tablesIntroEn: "For private lessons. 2-hour minimum.",
};
