import type { DisciplineId, MainDisciplineId } from "./disciplines";
import { isMainDiscipline } from "./disciplines";

export type InstructorSlug = string;

export type Instructor = {
  slug: InstructorSlug;
  name: string;
  disciplines: DisciplineId[];
  bioEs: string;
  bioEn: string;
  languages: ("es" | "en")[];
  active: boolean;
  sortOrder: number;
  /** Empty or default until a real photo is uploaded via admin. */
  photo: string;
};

/** Generic user silhouette used until each instructor has a real photo. */
export const DEFAULT_INSTRUCTOR_PHOTO = "/images/instructors/default.svg";

/**
 * Local invented placeholders → default avatar.
 * Keeps real uploads (https / storage URLs).
 */
export function resolveInstructorPhoto(photo: string | undefined | null): string {
  const value = typeof photo === "string" ? photo.trim() : "";
  if (!value) return DEFAULT_INSTRUCTOR_PHOTO;
  if (value === DEFAULT_INSTRUCTOR_PHOTO) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/images/instructors/")) return DEFAULT_INSTRUCTOR_PHOTO;
  return value;
}

export const instructors: Instructor[] = [
  {
    slug: "reche",
    name: "Reche",
    disciplines: ["esqui"],
    bioEs:
      "Instructora de esquí alpino. Clases dinámicas y cercanas para que disfrutes de Sierra Nevada desde el primer día.",
    bioEn:
      "Alpine ski instructor. Dynamic, friendly lessons so you enjoy Sierra Nevada from day one.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 1,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "patri",
    name: "Patri",
    disciplines: ["esqui"],
    bioEs:
      "Profesional, paciente y cercana. Especialista en esquí alpino para adultos, adolescentes y familias.",
    bioEn:
      "Professional, patient and approachable. Specialist in alpine skiing for adults, teens and families.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 2,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "lalo",
    name: "Lalo",
    disciplines: ["esqui", "snowboard", "telemark"],
    bioEs:
      "Instructor de esquí alpino, snowboard y telemark. Sesiones técnicas y amenas: pregunta tus objetivos y organiza la clase a tu medida.",
    bioEn:
      "Alpine ski, snowboard and telemark instructor. Technical yet fun sessions tailored to your goals.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 3,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "jorge",
    name: "Jorge",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor de esquí y snowboard con trato personal y clases amenas. Ideal para iniciación y para quien quiere seguir progresando con confianza.",
    bioEn:
      "Ski and snowboard instructor with a personal touch and engaging lessons. Great for beginners and those who want to keep progressing with confidence.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 4,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "esau",
    name: "Esaú",
    disciplines: ["esqui", "telemark", "esqui-adaptado"],
    bioEs:
      "Instructor de esquí alpino, telemark y esquí adaptado. Te acompaña desde los primeros pasos hasta esquiar con autonomía.",
    bioEn:
      "Alpine ski, telemark and adaptive ski instructor. Guides you from first steps to skiing independently.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 5,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "aitana",
    name: "Aitana",
    disciplines: ["esqui"],
    bioEs:
      "Instructora de esquí alpino. Clases dinámicas y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Alpine ski instructor. Dynamic, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 6,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "estrella",
    name: "Estrella",
    disciplines: ["snowboard"],
    bioEs:
      "Instructora de snowboard. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Snowboard instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 7,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "ale",
    name: "Ale",
    disciplines: ["snowboard"],
    bioEs:
      "Instructor de snowboard. Clases dinámicas para iniciación y perfeccionamiento en las pistas de Sierra Nevada.",
    bioEn:
      "Snowboard instructor. Dynamic lessons for beginners and improvers on Sierra Nevada's slopes.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 8,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "badillo",
    name: "Badillo",
    disciplines: ["snowboard"],
    bioEs:
      "Instructor de snowboard. Clases seguras y divertidas para disfrutar de la nieve en Sierra Nevada.",
    bioEn:
      "Snowboard instructor. Safe, fun lessons to enjoy the snow in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 9,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "maria",
    name: "María",
    disciplines: ["esqui"],
    bioEs:
      "Instructora de esquí alpino. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Alpine ski instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 10,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "eba",
    name: "Eba",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora de esquí y snowboard. Clases dinámicas y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Ski and snowboard instructor. Dynamic, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 11,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "ferran",
    name: "Ferran",
    disciplines: ["esqui"],
    bioEs:
      "Instructor de esquí alpino. Te guía en la nieve con la energía y profesionalidad del club.",
    bioEn:
      "Alpine ski instructor. Guides you on the snow with the club's energy and professionalism.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 12,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "luis",
    name: "Luis",
    disciplines: ["esqui", "telemark", "esqui-adaptado"],
    bioEs:
      "Instructor de esquí alpino, telemark y esquí adaptado. Clases dinámicas y cercanas para disfrutar de Sierra Nevada desde el primer día.",
    bioEn:
      "Alpine ski, telemark and adaptive ski instructor. Dynamic, friendly lessons to enjoy Sierra Nevada from day one.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 13,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "rocio",
    name: "Rocío",
    disciplines: ["esqui"],
    bioEs:
      "Instructora de esquí alpino. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Alpine ski instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 14,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "violeta",
    name: "Violeta",
    disciplines: ["esqui"],
    bioEs:
      "Instructora de esquí alpino. Clases seguras y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Alpine ski instructor. Safe, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 15,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "joan",
    name: "Joan",
    disciplines: ["esqui"],
    bioEs:
      "Instructor de esquí alpino. Te guía en la nieve con energía y profesionalidad en Sierra Nevada.",
    bioEn:
      "Alpine ski instructor. Guides you on the snow with energy and professionalism in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 16,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
  {
    slug: "benja",
    name: "Benja",
    disciplines: ["esqui"],
    bioEs:
      "Instructor de esquí alpino. Clases amenas y técnicas para iniciación y perfeccionamiento en la nieve.",
    bioEn:
      "Alpine ski instructor. Engaging, technical lessons for beginners and improvers on the snow.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 17,
    photo: DEFAULT_INSTRUCTOR_PHOTO,
  },
];

export const SNOWBOARD_ONLY_INSTRUCTOR_SLUGS = ["estrella", "badillo", "ale"] as const satisfies readonly InstructorSlug[];

export function isSnowboardOnlyInstructor(slug: string): boolean {
  return (SNOWBOARD_ONLY_INSTRUCTOR_SLUGS as readonly string[]).includes(slug);
}

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return instructors.find((i) => i.slug === slug);
}

export function getActiveInstructors(): Instructor[] {
  return instructors.filter((i) => i.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function instructorTeachesDiscipline(
  instructor: Instructor,
  disciplineId: MainDisciplineId,
): boolean {
  return instructor.disciplines.includes(disciplineId);
}

export function instructorCanTeachProduct(
  instructor: Instructor,
  productDisciplines: DisciplineId[],
): boolean {
  return productDisciplines.some((disciplineId) => {
    if (isMainDiscipline(disciplineId)) {
      return instructorTeachesDiscipline(instructor, disciplineId);
    }
    return false;
  });
}

export function getInstructorsForBooking(
  productDisciplines: DisciplineId[],
  selectedDiscipline?: MainDisciplineId,
  pool?: Instructor[],
): Instructor[] {
  const active = (pool ?? getActiveInstructors()).filter((i) => i.active).sort((a, b) => a.sortOrder - b.sortOrder);

  if (selectedDiscipline) {
    return active.filter((instructor) => instructorTeachesDiscipline(instructor, selectedDiscipline));
  }

  return active.filter((instructor) => instructorCanTeachProduct(instructor, productDisciplines));
}
