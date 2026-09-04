export type PistaLevel = "green" | "blue" | "red" | "black";

/**
 * Sectores del plano oficial Cetursa Sierra Nevada (temp. 2025/26).
 * Fuente: plano de pistas 03.12.2025 — umb.sierranevada.es
 */
export type PistaSectorId =
  | "borreguiles"
  | "pista-del-mar"
  | "rio-monachil"
  | "veleta"
  | "laguna-yeguas"
  | "loma-dilar"
  | "cauchiles-parador"
  | "sulayr";

export type Pista = {
  id: string;
  name: string;
  level: PistaLevel;
  sector: PistaSectorId;
};

export const PISTA_SECTORS: {
  id: PistaSectorId;
  nameEs: string;
  nameEn: string;
  blurbEs: string;
  blurbEn: string;
}[] = [
  {
    id: "borreguiles",
    nameEs: "Borreguiles",
    nameEn: "Borreguiles",
    blurbEs: "Corazón de la estación: principiantes, verdes y azules.",
    blurbEn: "Resort hub: beginners, greens and blues.",
  },
  {
    id: "pista-del-mar",
    nameEs: "Pista del Mar / Familiar",
    nameEn: "Pista del Mar / Family",
    blurbEs: "Zona familiar junto a Borreguiles (Piñata, La Peña).",
    blurbEn: "Family area by Borreguiles (Piñata, La Peña).",
  },
  {
    id: "rio-monachil",
    nameEs: "Río Monachil",
    nameEn: "Río Monachil",
    blurbEs: "Descensos a Pradollano: El Río, Maribel y enlaces.",
    blurbEn: "Descents to Pradollano: El Río, Maribel and links.",
  },
  {
    id: "veleta",
    nameEs: "Veleta",
    nameEn: "Veleta",
    blurbEs: "Cota alta: Águila y descensos largos.",
    blurbEn: "High elevation: Águila and long runs.",
  },
  {
    id: "laguna-yeguas",
    nameEs: "Laguna de las Yeguas",
    nameEn: "Laguna de las Yeguas",
    blurbEs: "Zona técnica con menos afluencia.",
    blurbEn: "Technical area with fewer crowds.",
  },
  {
    id: "loma-dilar",
    nameEs: "Loma Dílar",
    nameEn: "Loma Dílar",
    blurbEs: "Valle Dílar: Montebajo, Monachil, Neveros…",
    blurbEn: "Dílar valley: Montebajo, Monachil, Neveros…",
  },
  {
    id: "cauchiles-parador",
    nameEs: "Cauchiles / Parador",
    nameEn: "Cauchiles / Parador",
    blurbEs: "Enlace entre Borreguiles, Stadium y Veleta.",
    blurbEn: "Link between Borreguiles, Stadium and Veleta.",
  },
  {
    id: "sulayr",
    nameEs: "Parque Sulayr",
    nameEn: "Sulayr Park",
    blurbEs: "Freestyle: slope style, cross y halfpipe.",
    blurbEn: "Freestyle: slope style, cross and halfpipe.",
  },
];

/**
 * Selección práctica de pistas reales del plano 2025/26 para recomendaciones
 * de clase (no es el catálogo completo de ~130 pistas).
 * Dificultades según clasificación habitual de la estación / guías locales.
 */
export const SIERRA_NEVADA_PISTAS: Pista[] = [
  // Borreguiles
  { id: "principiantes-1", name: "Principiantes 1", level: "green", sector: "borreguiles" },
  { id: "principiantes-2", name: "Principiantes 2", level: "green", sector: "borreguiles" },
  { id: "el-bosque", name: "El Bosque", level: "green", sector: "borreguiles" },
  { id: "super-verde", name: "Super verde", level: "green", sector: "borreguiles" },
  { id: "amapola", name: "Amapola", level: "green", sector: "borreguiles" },
  { id: "paralelo", name: "Paralelo", level: "blue", sector: "borreguiles" },
  { id: "peseta", name: "Peseta", level: "blue", sector: "borreguiles" },
  { id: "zorro", name: "Zorro", level: "blue", sector: "borreguiles" },
  { id: "perdiz", name: "Perdiz", level: "blue", sector: "borreguiles" },
  { id: "tubo-borreguiles", name: "Tubo Borreguiles", level: "red", sector: "borreguiles" },
  { id: "penones", name: "Peñones", level: "red", sector: "borreguiles" },
  { id: "collado-borreguiles", name: "Collado de Borreguiles", level: "blue", sector: "borreguiles" },
  { id: "panoramica-ii", name: "Panorámica II", level: "blue", sector: "borreguiles" },

  // Pista del Mar / familiar
  { id: "pinata-1", name: "Piñata 1", level: "green", sector: "pista-del-mar" },
  { id: "pinata-2", name: "Piñata 2", level: "green", sector: "pista-del-mar" },
  { id: "la-pena", name: "La Peña", level: "green", sector: "pista-del-mar" },

  // Río Monachil → Pradollano
  { id: "zaragatillo", name: "Zaragatillo", level: "green", sector: "rio-monachil" },
  { id: "el-rio", name: "El Río", level: "blue", sector: "rio-monachil" },
  { id: "maribel", name: "Maribel", level: "blue", sector: "rio-monachil" },
  { id: "levante", name: "Levante", level: "blue", sector: "rio-monachil" },
  { id: "ribera-del-genil", name: "Ribera del Genil", level: "blue", sector: "rio-monachil" },
  { id: "ramal-de-jara", name: "Ramal de Jara", level: "blue", sector: "rio-monachil" },
  { id: "burladero", name: "Burladero", level: "blue", sector: "rio-monachil" },

  // Veleta
  { id: "aguila", name: "Águila", level: "black", sector: "veleta" },
  { id: "tobogan", name: "Tobogán", level: "red", sector: "veleta" },
  { id: "lastron", name: "Lastrón", level: "red", sector: "veleta" },
  { id: "panoramica", name: "Panorámica", level: "red", sector: "veleta" },
  { id: "descenso-damas", name: "Descenso Damas", level: "red", sector: "veleta" },

  // Laguna de las Yeguas
  { id: "dorada", name: "Dorada", level: "blue", sector: "laguna-yeguas" },
  { id: "sociedad-de-la-nieve", name: "Sociedad de la Nieve", level: "red", sector: "laguna-yeguas" },
  { id: "laguna", name: "Laguna", level: "red", sector: "laguna-yeguas" },
  { id: "llano-nieve", name: "Llano de la Nieve", level: "blue", sector: "laguna-yeguas" },

  // Loma Dílar
  { id: "montebajo", name: "Montebajo", level: "red", sector: "loma-dilar" },
  { id: "monachil", name: "Monachil", level: "blue", sector: "loma-dilar" },
  { id: "prado-de-las-monjas", name: "Prado de las Monjas", level: "blue", sector: "loma-dilar" },
  { id: "violetas", name: "Violetas", level: "red", sector: "loma-dilar" },
  { id: "villen", name: "Villén", level: "red", sector: "loma-dilar" },
  { id: "vibora", name: "Víbora", level: "red", sector: "loma-dilar" },
  { id: "neveros", name: "Neveros", level: "red", sector: "loma-dilar" },
  { id: "el-puente", name: "El Puente", level: "blue", sector: "loma-dilar" },
  { id: "tropical", name: "Tropical", level: "blue", sector: "loma-dilar" },
  { id: "dilar", name: "Loma Dílar", level: "red", sector: "loma-dilar" },

  // Cauchiles / Parador
  { id: "stadium", name: "Stadium (enlace)", level: "blue", sector: "cauchiles-parador" },
  { id: "parador", name: "Parador", level: "blue", sector: "cauchiles-parador" },
  { id: "jara", name: "Jara", level: "red", sector: "cauchiles-parador" },
  { id: "diagonal-cauchiles", name: "Diagonal de Cauchiles", level: "blue", sector: "cauchiles-parador" },
  { id: "espolon-alcazaba", name: "Espolón de Alcazaba", level: "red", sector: "cauchiles-parador" },

  // Sulayr
  { id: "sulayr-sector-1", name: "Sulayr Sector 1", level: "blue", sector: "sulayr" },
  { id: "sulayr-slope-style", name: "Sulayr Slope Style", level: "red", sector: "sulayr" },
  { id: "sulayr-cross", name: "Ski / Snowboard Cross", level: "red", sector: "sulayr" },
  { id: "half-pipe", name: "Half Pipe", level: "red", sector: "sulayr" },

  // Legacy IDs kept so fichas antiguas siguen resolviendo nombre
  { id: "borreguiles", name: "Borreguiles (zona)", level: "green", sector: "borreguiles" },
  { id: "pradollano", name: "Pradollano (base)", level: "green", sector: "rio-monachil" },
  { id: "veleta", name: "Veleta (zona)", level: "red", sector: "veleta" },
  { id: "monument", name: "Monument", level: "red", sector: "veleta" },
  { id: "lagunillo", name: "Lagunillo Largo", level: "red", sector: "laguna-yeguas" },
  { id: "visera", name: "Visera", level: "red", sector: "loma-dilar" },
  { id: "piramide", name: "Pirámide", level: "black", sector: "veleta" },
  { id: "tajo-de-la-cruz", name: "Tajo de la Cruz", level: "black", sector: "laguna-yeguas" },
];

/** Pistas ofrecidas al monitor al recomendar (sin entradas “zona” legacy). */
export const RECOMMENDABLE_PISTA_IDS = new Set(
  SIERRA_NEVADA_PISTAS.filter(
    (pista) =>
      ![
        "borreguiles",
        "pradollano",
        "veleta",
        "monument",
        "lagunillo",
        "visera",
        "piramide",
        "tajo-de-la-cruz",
      ].includes(pista.id),
  ).map((pista) => pista.id),
);

export const PISTA_LEVEL_LABEL: Record<PistaLevel, { es: string; en: string }> = {
  green: { es: "Verde", en: "Green" },
  blue: { es: "Azul", en: "Blue" },
  red: { es: "Roja", en: "Red" },
  black: { es: "Negra", en: "Black" },
};

export function getPistaById(id: string): Pista | undefined {
  return SIERRA_NEVADA_PISTAS.find((pista) => pista.id === id);
}

export function getPistaSector(id: PistaSectorId) {
  return PISTA_SECTORS.find((sector) => sector.id === id);
}

export function sectorName(id: PistaSectorId, locale: string): string {
  const sector = getPistaSector(id);
  if (!sector) return id;
  return locale === "en" ? sector.nameEn : sector.nameEs;
}

export function recommendablePistasBySector(): {
  sector: (typeof PISTA_SECTORS)[number];
  pistas: Pista[];
}[] {
  return PISTA_SECTORS.map((sector) => ({
    sector,
    pistas: SIERRA_NEVADA_PISTAS.filter(
      (pista) => pista.sector === sector.id && RECOMMENDABLE_PISTA_IDS.has(pista.id),
    ),
  })).filter((group) => group.pistas.length > 0);
}
