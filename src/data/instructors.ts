import type { DisciplineId } from "./disciplines";

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
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora de esquí alpino y snowboard. Clases dinámicas y cercanas para que disfrutes de Sierra Nevada desde el primer día.",
    bioEn:
      "Alpine ski and snowboard instructor. Dynamic, friendly lessons so you enjoy Sierra Nevada from day one.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 1,
    photo: "/images/instructors/reche.jpg",
  },
  {
    slug: "patri",
    name: "Patri",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Profesional, paciente y cercana. Especialista en esquí alpino y snowboard para adultos, adolescentes y familias.",
    bioEn:
      "Professional, patient and approachable. Specialist in alpine skiing and snowboard for adults, teens and families.",
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
      "Perfil internacional en esquí, snowboard y telemark. Sesiones técnicas y amenas: pregunta tus objetivos y organiza la clase a tu medida.",
    bioEn:
      "International profile across ski, snowboard and telemark. Technical yet fun sessions tailored to your goals.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 3,
    photo: "/images/instructors/lalo.jpg",
  },
  {
    slug: "jorge",
    name: "Jorge",
    disciplines: ["esqui", "snowboard", "esqui-adaptado", "telemark"],
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
    disciplines: ["esqui", "esqui-adaptado"],
    bioEs:
      "Instructor de esquí alpino con enfoque cercano y didáctico. Te acompaña desde los primeros pasos hasta esquiar con autonomía.",
    bioEn:
      "Alpine ski instructor with a close, teaching-focused approach. Guides you from first steps to skiing independently.",
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
    disciplines: ["esqui"],
    bioEs:
      "Instructora del equipo Explora. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Explora team instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
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
    photo: "/images/instructors/ale.jpg",
  },
  {
    slug: "badillo",
    name: "Badillo",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor del equipo Explora. Clases seguras y divertidas para disfrutar de la nieve en Sierra Nevada.",
    bioEn:
      "Explora team instructor. Safe, fun lessons to enjoy the snow in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 9,
    photo: "/images/instructors/badillo.svg",
  },
  {
    slug: "maria",
    name: "María",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora del equipo Explora. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Explora team instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
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
      "Instructora del equipo Explora. Clases dinámicas y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Explora team instructor. Dynamic, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 11,
    photo: "/images/instructors/eva.svg",
  },
  {
    slug: "ferran",
    name: "Ferran",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor del equipo Explora. Te guía en esquí y snowboard con la energía y profesionalidad del club.",
    bioEn:
      "Explora team instructor. Guides you in ski and snowboard with the club's energy and professionalism.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 12,
    photo: "/images/instructors/ferran.jpg",
  },
  {
    slug: "luis",
    name: "Luis",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor del equipo Explora. Clases dinámicas y cercanas para disfrutar de Sierra Nevada desde el primer día.",
    bioEn:
      "Explora team instructor. Dynamic, friendly lessons to enjoy Sierra Nevada from day one.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 13,
    photo: "/images/instructors/luis.svg",
  },
  {
    slug: "rocio",
    name: "Rocío",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora del equipo Explora. Clases personalizadas en Sierra Nevada con el trato cercano que nos caracteriza.",
    bioEn:
      "Explora team instructor. Personalised lessons in Sierra Nevada with our signature friendly approach.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 14,
    photo: "/images/instructors/rocio.svg",
  },
  {
    slug: "violeta",
    name: "Violeta",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructora del equipo Explora. Clases seguras y divertidas para todas las edades y niveles en Sierra Nevada.",
    bioEn:
      "Explora team instructor. Safe, fun lessons for all ages and levels in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 15,
    photo: "/images/instructors/violeta.svg",
  },
  {
    slug: "joan",
    name: "Joan",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor del equipo Explora. Te guía en esquí y snowboard con energía y profesionalidad en Sierra Nevada.",
    bioEn:
      "Explora team instructor. Guides you in ski and snowboard with energy and professionalism in Sierra Nevada.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 16,
    photo: "/images/instructors/joan.svg",
  },
  {
    slug: "benja",
    name: "Benja",
    disciplines: ["esqui", "snowboard"],
    bioEs:
      "Instructor del equipo Explora. Clases amenas y técnicas para iniciación y perfeccionamiento en la nieve.",
    bioEn:
      "Explora team instructor. Engaging, technical lessons for beginners and improvers on the snow.",
    languages: ["es", "en"],
    active: true,
    sortOrder: 17,
    photo: "/images/instructors/benja.svg",
  },
];

export function getInstructorBySlug(slug: InstructorSlug): Instructor | undefined {
  return instructors.find((i) => i.slug === slug);
}

export function getActiveInstructors(): Instructor[] {
  return instructors.filter((i) => i.active).sort((a, b) => a.sortOrder - b.sortOrder);
}
