export type MainDisciplineId =
  | "esqui"
  | "snowboard"
  | "telemark"
  | "esqui-adaptado"
  | "ninos";

export type ModalityId = "freestyle" | "freeride";

export type DisciplineId = MainDisciplineId | ModalityId;

export type Discipline = {
  id: MainDisciplineId;
  slug: MainDisciplineId;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  /** @pending Photo pending — upload to public/images/legacy/ */
  image: string;
  sortOrder: number;
};

export type Modality = {
  id: ModalityId;
  slug: ModalityId;
  parentIds: MainDisciplineId[];
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  image: string;
  sortOrder: number;
  /** Parent-specific copy and display order */
  parents: Partial<
    Record<
      "esqui" | "snowboard",
      {
        sortOrder: number;
        descriptionEs: string;
        descriptionEn: string;
        highlightsEs: string[];
        highlightsEn: string[];
        levelEs: string;
        levelEn: string;
      }
    >
  >;
};

export const mainDisciplines: Discipline[] = [
  {
    id: "esqui",
    slug: "esqui",
    nameEs: "Esquí alpino",
    nameEn: "Alpine skiing",
    descriptionEs:
      "Clases de 1 a 8 participantes para todas las edades y niveles en pista, freeride y freestyle. Instructores titulados en Sierra Nevada.",
    descriptionEn:
      "Lessons for 1 to 8 participants for all ages and levels on piste, freeride and freestyle. Qualified instructors at Sierra Nevada ski resort.",
    image: "/images/stock/discipline-esqui-pista.jpg",
    sortOrder: 1,
  },
  {
    id: "snowboard",
    slug: "snowboard",
    nameEs: "Snowboard",
    nameEn: "Snowboard",
    descriptionEs:
      "Desde tus primeros giros hasta perfeccionamiento en pista, snowpark y fuera de pista. Instructores especializados en Sierra Nevada.",
    descriptionEn:
      "From your first turns to coaching on piste, in the snowpark and off-piste. Specialist instructors in Sierra Nevada.",
    image: "/images/stock/discipline-snowboard.jpg",
    sortOrder: 2,
  },
  {
    id: "telemark",
    slug: "telemark",
    nameEs: "Telemark",
    nameEn: "Telemark",
    descriptionEs:
      "Descubre el esquí nórdico en la estación con instructores que dominan la disciplina.",
    descriptionEn:
      "Discover Nordic-style skiing in the resort with instructors who master the discipline.",
    image: "/images/stock/discipline-telemark.jpg",
    sortOrder: 3,
  },
  {
    id: "esqui-adaptado",
    slug: "esqui-adaptado",
    nameEs: "Esquí adaptado",
    nameEn: "Adaptive skiing",
    descriptionEs:
      "Clases individualizadas e inclusivas para disfrutar de la nieve con seguridad.",
    descriptionEn:
      "Individualized, inclusive lessons to enjoy the snow safely.",
    image: "/images/stock/discipline-adaptado.jpg",
    sortOrder: 4,
  },
  {
    id: "ninos",
    slug: "ninos",
    nameEs: "Clases para niños",
    nameEn: "Kids lessons",
    descriptionEs:
      "Clases de 1 a 8 participantes. Niños desde 3 años. Clases dinámicas y divertidas para aprender jugando.",
    descriptionEn:
      "Lessons for 1 to 8 participants. Children from 3 years. Fun, dynamic lessons where children learn through play.",
    image: "/images/stock/discipline-ninos-explora.jpg",
    sortOrder: 5,
  },
];

export const modalities: Modality[] = [
  {
    id: "freeride",
    slug: "freeride",
    parentIds: ["esqui", "snowboard"],
    nameEs: "Freeride",
    nameEn: "Freeride",
    descriptionEs:
      "Explora fuera de pista y descubre todo lo que la alta montaña de Sierra Nevada ofrece.",
    descriptionEn:
      "Explore off-piste terrain and discover what Sierra Nevada's high mountains have to offer.",
    image: "/images/stock/discipline-freeride.jpg",
    sortOrder: 2,
    parents: {
      esqui: {
        sortOrder: 1,
        descriptionEs:
          "Sal de la pista marcada con seguridad. Trabajamos técnica de virajes, lectura del terreno y nieve fuera de pista en Sierra Nevada.",
        descriptionEn:
          "Leave the groomed runs safely. We work on turn technique, terrain reading and off-piste snow in Sierra Nevada.",
        highlightsEs: [
          "Líneas fuera de pista en Sierra Nevada y alrededores",
          "Técnica adaptada a nieve polvo y variable",
          "Enfoque en seguridad y progresión gradual",
        ],
        highlightsEn: [
          "Off-piste lines in Sierra Nevada and surrounding areas",
          "Technique adapted to powder and variable snow",
          "Safety-first approach with gradual progression",
        ],
        levelEs: "Nivel intermedio o avanzado recomendado",
        levelEn: "Intermediate or advanced level recommended",
      },
      snowboard: {
        sortOrder: 2,
        descriptionEs:
          "Explora laderas y fresas fuera de pista con un instructor que te guíe en la elección de línea y la técnica en nieve variable.",
        descriptionEn:
          "Explore slopes and off-piste runs with an instructor guiding your line choice and technique in variable snow.",
        highlightsEs: [
          "Técnica en fresa y nieve sin preparar",
          "Lectura del terreno y elección de línea",
          "Progresión según tu nivel y condiciones del día",
        ],
        highlightsEn: [
          "Technique in off-piste and ungroomed snow",
          "Terrain reading and line choice",
          "Progression based on your level and daily conditions",
        ],
        levelEs: "Nivel intermedio o avanzado recomendado",
        levelEn: "Intermediate or advanced level recommended",
      },
    },
  },
  {
    id: "freestyle",
    slug: "freestyle",
    parentIds: ["esqui", "snowboard"],
    nameEs: "Freestyle",
    nameEn: "Freestyle",
    descriptionEs:
      "Trucos, saltos y progresión en snowpark con enfoque técnico y seguro.",
    descriptionEn:
      "Tricks, jumps and snowpark progression with a safe, technical approach.",
    image: "/images/stock/discipline-freestyle.jpg",
    sortOrder: 1,
    parents: {
      esqui: {
        sortOrder: 2,
        descriptionEs:
          "Progresión en snowpark: saltos, boxes y rails con instructores que conocen las instalaciones de la estación.",
        descriptionEn:
          "Snowpark progression: jumps, boxes and rails with instructors who know the resort features.",
        highlightsEs: [
          "Iniciación y perfeccionamiento en snowpark",
          "Trabajo de saltos, deslizamientos y aterrizajes",
          "Supervisión cercana y progresión por objetivos",
        ],
        highlightsEn: [
          "Introduction and coaching in the snowpark",
          "Work on jumps, slides and landings",
          "Close supervision and goal-based progression",
        ],
        levelEs: "Desde nivel intermedio en pista",
        levelEn: "From intermediate piste level",
      },
      snowboard: {
        sortOrder: 1,
        descriptionEs:
          "Aprende trucos, butter y saltos en el snowpark. Desde los primeros drops en cajones hasta perfeccionamiento en línea.",
        descriptionEn:
          "Learn tricks, butters and jumps in the snowpark. From first box drops to line perfection.",
        highlightsEs: [
          "Snowpark de Sierra Nevada y progresión por features",
          "Trucos, saltos y estilo en línea",
          "Clases dinámicas adaptadas a tu nivel",
        ],
        highlightsEn: [
          "Sierra Nevada snowpark and feature-by-feature progression",
          "Tricks, jumps and style on a line",
          "Dynamic lessons adapted to your level",
        ],
        levelEs: "Desde nivel intermedio en pista",
        levelEn: "From intermediate piste level",
      },
    },
  },
];

/** @deprecated Use mainDisciplines — kept for backward compatibility */
export const disciplines = mainDisciplines;

export function getMainDisciplines(): Discipline[] {
  return mainDisciplines;
}

export function getDisciplineBySlug(slug: string): Discipline | undefined {
  return mainDisciplines.find((d) => d.slug === slug);
}

export function getModalityById(id: ModalityId): Modality | undefined {
  return modalities.find((m) => m.id === id);
}

export function getModalitiesForParent(parentId: MainDisciplineId): Modality[] {
  return modalities
    .filter((m) => m.parentIds.includes(parentId))
    .sort((a, b) => {
      const orderA = a.parents[parentId as "esqui" | "snowboard"]?.sortOrder ?? a.sortOrder;
      const orderB = b.parents[parentId as "esqui" | "snowboard"]?.sortOrder ?? b.sortOrder;
      return orderA - orderB;
    });
}

export function getModalityContent(
  modality: Modality,
  parentId: MainDisciplineId,
  locale: string,
): {
  description: string;
  highlights: string[];
  level: string;
} {
  const parentContent = modality.parents[parentId as "esqui" | "snowboard"];
  const isEn = locale === "en";

  return {
    description: isEn
      ? parentContent?.descriptionEn ?? modality.descriptionEn
      : parentContent?.descriptionEs ?? modality.descriptionEs,
    highlights: isEn
      ? parentContent?.highlightsEn ?? []
      : parentContent?.highlightsEs ?? [],
    level: isEn ? parentContent?.levelEn ?? "" : parentContent?.levelEs ?? "",
  };
}

export function isModality(id: DisciplineId): id is ModalityId {
  return id === "freestyle" || id === "freeride";
}

export function isMainDiscipline(id: DisciplineId): id is MainDisciplineId {
  return !isModality(id);
}

/** Adaptive ski is always one-to-one — never group lessons. */
export function isIndividualizedDiscipline(disciplineId: MainDisciplineId): boolean {
  return disciplineId === "esqui-adaptado";
}

export function getParentDisciplineId(id: DisciplineId): MainDisciplineId | undefined {
  if (isMainDiscipline(id)) return id;
  return undefined;
}

export function productMatchesDiscipline(
  productDisciplines: DisciplineId[],
  disciplineId: MainDisciplineId,
): boolean {
  return productDisciplines.some((d) => {
    if (d === disciplineId) return true;
    if (isModality(d)) {
      const modality = getModalityById(d);
      return modality?.parentIds.includes(disciplineId) ?? false;
    }
    return false;
  });
}

/** When a product only allows one main discipline, returns it (e.g. curso-snow → snowboard). */
export function getSingleProductDiscipline(
  productDisciplines: DisciplineId[],
): MainDisciplineId | undefined {
  const mainDisciplines = productDisciplines.filter((d): d is MainDisciplineId =>
    isMainDiscipline(d),
  );
  return mainDisciplines.length === 1 ? mainDisciplines[0] : undefined;
}

export function getDisciplineDisplayName(
  locale: string,
  disciplineId?: MainDisciplineId,
  modalityId?: ModalityId,
): string | undefined {
  if (!disciplineId) return undefined;

  const discipline = mainDisciplines.find((d) => d.id === disciplineId);
  if (!discipline) return undefined;

  const base = locale === "en" ? discipline.nameEn : discipline.nameEs;

  if (!modalityId) return base;

  const modality = getModalityById(modalityId);
  if (!modality) return base;

  const modName = locale === "en" ? modality.nameEn : modality.nameEs;
  return locale === "en" ? `${base} · ${modName}` : `${base} · ${modName}`;
}
