import type { DisciplineId, MainDisciplineId } from "./disciplines";
import { isMainDiscipline } from "./disciplines";

export type InstructorSlug =
  | "reche"
  | "patri"
  | "lalo"
  | "jorge"
  | "esau"
  | "aitana"
  | "estrella"
  | "ale"
  | "badillo"
  | "maria"
  | "eva"
  | "ferran"
  | "luis"
  | "rocio"
  | "violeta"
  | "joan"
  | "benja";

export type Instructor = {
  slug: InstructorSlug;
  name: string;
  disciplines: DisciplineId[];
  bioEs: string;
  bioEn: string;
  languages: ("es" | "en")[];
  active: boolean;
  sortOrder: number;
  /** @pending Photo pending — upload to public/images/legacy/instructor-{slug}.webp */
  photo: string;
};

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
    photo: "/images/instructors/reche.jpg",
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
    photo: "/images/instructors/patri.jpg",
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
    photo: "/images/instructors/lalo.jpg",
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
    photo: "/images/instructors/jorge.jpg",
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
    photo: "/images/instructors/esau.jpg",
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
    photo: "/images/instructors/aitana.jpg",
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
    photo: "/images/instructors/estrella.jpg",
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
    photo: "/images/instructors/ale.svg",
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
    photo: "/images/instructors/badillo.svg",
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
    photo: "/images/instructors/maria.svg",
  },
  {
    slug: "eva",
    name: "Eva",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora de esquí y snowboard. Clases dinámicas y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Ski and snowboard instructor. Dynamic, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 11,
    photo: "/images/instructors/eva.svg",
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
    photo: "/images/instructors/ferran.jpg",
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
    photo: "/images/instructors/luis.svg",
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
    photo: "/images/instructors/rocio.svg",
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
    photo: "/images/instructors/violeta.svg",
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
    photo: "/images/instructors/joan.svg",
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
    photo: "/images/instructors/benja.svg",
  },
];

export const SNOWBOARD_ONLY_INSTRUCTOR_SLUGS = ["estrella", "badillo", "ale"] as const satisfies readonly InstructorSlug[];

export function isSnowboardOnlyInstructor(slug: string): boolean {
  return (SNOWBOARD_ONLY_INSTRUCTOR_SLUGS as readonly string[]).includes(slug);
}

export function getInstructorBySlug(slug: InstructorSlug): Instructor | undefined {
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
): Instructor[] {
  const active = getActiveInstructors();

  if (selectedDiscipline) {
    return active.filter((instructor) => instructorTeachesDiscipline(instructor, selectedDiscipline));
  }

  return active.filter((instructor) => instructorCanTeachProduct(instructor, productDisciplines));
}
