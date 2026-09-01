import { CURRENT_SEASON } from "./season";

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

/** Current offer visible on home/clases — temporada 2026/27 */
export const currentPrices: CurrentProductPrice[] = [
  {
    id: "full-day-current",
    productId: "full-day",
    titleEs: "Full Day",
    titleEn: "Full Day",
    season: CURRENT_SEASON.key,
    unit: "day",
    fromPrice: 160,
    hours: 5,
    extras: [
      {
        labelEs: "Persona extra",
        labelEn: "Extra person",
        value: "+25 €",
      },
    ],
    featuresEs: [
      "5 horas de clase efectivas",
      "1 hora de descanso",
      "+25 € por persona extra",
      "Horario ajustado a sus necesidades",
      "Punto de encuentro personalizado",
    ],
    featuresEn: [
      "5 hours of effective lesson time",
      "1 hour break",
      "+25 € per extra person",
      "Schedule tailored to your needs",
      "Personalised meeting point",
    ],
  },
  {
    id: "curso-snow-current",
    productId: "curso-snow",
    titleEs: "Curso de Snowboard",
    titleEn: "Snowboard Course",
    season: CURRENT_SEASON.key,
    fromPrice: 60,
    unit: "person",
    hours: 3,
    featuresEs: [
      "Rendimiento Asegurado",
      "60 € / persona",
      "Mínimo 3 personas para realizar el curso",
      "Máximo 6 personas",
      "3 horas de clase efectivas",
      "Horario 10:00–13:00",
    ],
    featuresEn: [
      "Guaranteed Progress",
      "€60 / person",
      "Minimum 3 people required to run the course",
      "Maximum 6 people",
      "3 hours of effective lesson time",
      "Schedule 10:00–13:00",
    ],
  },
];

/** Tarifas temporada 2026/27 — mismas tablas usadas por el motor de reservas */
export const seasonPriceTables: PriceTable[] = [
  {
    id: "full-day-1-4",
    titleEs: "FULL-DAY",
    titleEn: "FULL-DAY",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "1–4 personas",
    headers: ["Horario", "1 persona", "2 personas", "3 personas", "4 personas"],
    rows: [{ schedule: "10:00 – 16:00", prices: [160, 180, 200, 220] }],
  },
  {
    id: "full-day-5-8",
    titleEs: "FULL-DAY",
    titleEn: "FULL-DAY",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "5–8 personas",
    headers: ["Horario", "5 personas", "6 personas", "7 personas", "8 personas"],
    rows: [{ schedule: "10:00 – 16:00", prices: [240, 260, 280, 300] }],
  },
  {
    id: "clases-2h-1-4",
    titleEs: "CLASES DE 2 HORAS",
    titleEn: "2-HOUR LESSONS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "1–4 personas",
    headers: ["Horario", "1 persona", "2 personas", "3 personas", "4 personas"],
    rows: [
      { schedule: "10:00–12:00", prices: [75, 85, 95, 105] },
      { schedule: "12:00–14:00", prices: [70, 80, 90, 100] },
      { schedule: "14:00–16:00", prices: [65, 75, 85, 95] },
    ],
  },
  {
    id: "clases-2h-5-8",
    titleEs: "CLASES GRUPALES – 2 HORAS",
    titleEn: "GROUP LESSONS – 2 HOURS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "5–8 personas",
    headers: ["Horario", "5 personas", "6 personas", "7 personas", "8 personas"],
    rows: [
      { schedule: "10:00–12:00", prices: [115, 125, 135, 145] },
      { schedule: "12:00–14:00", prices: [110, 120, 130, 140] },
      { schedule: "14:00–16:00", prices: [105, 115, 125, 135] },
    ],
  },
  {
    id: "clases-3h-1-4",
    titleEs: "CLASES DE 3 HORAS",
    titleEn: "3-HOUR LESSONS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "1–4 personas",
    headers: ["Horario", "1 persona", "2 personas", "3 personas", "4 personas"],
    rows: [
      { schedule: "10:00–13:00", prices: [120, 135, 150, 165] },
      { schedule: "10:00–12:00 y 14:00–15:00", prices: [110, 125, 140, 155] },
      { schedule: "12:00–15:00", prices: [110, 125, 140, 155] },
      { schedule: "14:00–17:00", prices: [100, 115, 130, 145] },
    ],
  },
  {
    id: "clases-3h-5-8",
    titleEs: "CLASES GRUPALES – 3 HORAS",
    titleEn: "GROUP LESSONS – 3 HOURS",
    season: CURRENT_SEASON.key,
    groupSizeLabel: "5–8 personas",
    headers: ["Horario", "5 personas", "6 personas", "7 personas", "8 personas"],
    rows: [
      { schedule: "09:00–12:00", prices: [170, 185, 200, 215] },
      { schedule: "10:00–13:00", prices: [180, 195, 210, 225] },
      { schedule: "10:00–12:00 y 14:00–15:00", prices: [170, 185, 200, 215] },
      { schedule: "12:00–15:00", prices: [170, 185, 200, 215] },
      { schedule: "14:00–17:00", prices: [160, 175, 190, 205] },
    ],
  },
];

/** @deprecated Use seasonPriceTables */
export const legacyPriceTables = seasonPriceTables;

/** Legacy home product starting prices (brief §1.4B) */
export const legacyFromPrices = [
  {
    productId: "full-day",
    fromPrice: 160,
    labelEs: "Full Day — desde 160 €",
    labelEn: "Full Day — from €160",
    descriptionEs: "5 h + 1 h comodín. Experiencia personalizada. Recogida en hotel.",
    descriptionEn: "5 h lesson + 1 h buffer. Personalised experience. Hotel pick-up.",
  },
  {
    productId: "medio-dia",
    fromPrice: 65,
    labelEs: "Clases Forfait medio día — desde 65 €",
    labelEn: "Half-day lift pass lessons — from €65",
    descriptionEs: "2 h a partir de las 13:00.",
    descriptionEn: "2 h from 1:00 pm.",
  },
  {
    productId: "clase-grabada",
    fromPrice: 20,
    labelEs: "Clase grabada — desde 20 €",
    labelEn: "Recorded lesson — from €20",
    descriptionEs: "Vídeo correcciones.",
    descriptionEn: "Video feedback.",
  },
] as const;

export const priceNotes = {
  vatEs: "Todos los precios tienen el IVA incluido.",
  vatEn: "All prices include VAT.",
  extraPersonLegacyEs: "Incremento típico legado: +10/15 € por persona extra.",
  extraPersonLegacyEn: "Typical legacy surcharge: +€10/15 per extra person.",
  extraPersonCurrentEs: "Full Day actual: +25 € por persona extra.",
  extraPersonCurrentEn: "Current Full Day: +€25 per extra person.",
};
