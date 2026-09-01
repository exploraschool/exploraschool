import type { DisciplineId } from "./disciplines";
import { CURRENT_SEASON } from "./season";
import { site } from "./site";
import {
  CURSO_SNOW_PER_PERSON_EUR,
  HOURLY_ANCHOR_EUR,
  SESSION_2H_STANDARD,
  SESSION_3H_AFTERNOON,
  SESSION_FULL_DAY,
} from "@/lib/lesson-pricing";

export type ProductId =
  | "full-day"
  | "full-day-ninos"
  | "full-day-tour"
  | "full-day-iniciacion"
  | "full-day-tecnico"
  | "medio-dia"
  | "curso-snow"
  | "particular"
  | "curso-empresa"
  | "grupal";

export type ProductCategory =
  | "full-day"
  | "half-day"
  | "course"
  | "private"
  | "group";

export type Product = {
  id: ProductId;
  slug: ProductId;
  category: ProductCategory;
  titleEs: string;
  titleEn: string;
  shortDescriptionEs: string;
  shortDescriptionEn: string;
  descriptionEs: string;
  descriptionEn: string;
  disciplines: DisciplineId[];
  fromPrice?: number;
  hours?: number;
  minPeople?: number;
  maxPeople?: number;
  minAge?: number;
  scheduleEs?: string;
  scheduleEn?: string;
  featuresEs: string[];
  featuresEn: string[];
  season: typeof CURRENT_SEASON.key | "legacy-2022" | "both";
  highlighted: boolean;
  sortOrder: number;
  /** @pending Photo pending — upload to public/images/gallery-01.svg */
  image: string;
};

export const products: Product[] = [
  {
    id: "full-day",
    slug: "full-day",
    category: "full-day",
    titleEs: "Full Day",
    titleEn: "Full Day",
    shortDescriptionEs: "5 h de clase + 1 h comodín. Experiencia personalizada.",
    shortDescriptionEn: "5 h lesson + 1 h buffer. Personalised experience.",
    descriptionEs:
      "Actividad de día completo con 5 horas de clase efectivas y 1 hora de comodín para recogida en hotel, retrasos, descansos y comidas. Horario ajustado a tus necesidades y punto de encuentro personalizado.",
    descriptionEn:
      "Full-day activity with 5 hours of effective lesson time and 1 hour buffer for hotel pick-up, delays, breaks and meals. Schedule tailored to your needs with a personalised meeting point.",
    disciplines: ["esqui", "snowboard", "telemark", "esqui-adaptado"],
    fromPrice: SESSION_FULL_DAY[0],
    hours: 6,
    minPeople: 1,
    maxPeople: 8,
    featuresEs: [
      "5 horas de clase efectivas",
      "1 hora de descanso / comodín",
      "De 1 a 8 participantes",
      "Horario ajustado a tus necesidades",
      "Punto de encuentro personalizado",
      "Recogida en hotel (Full-Day)",
    ],
    featuresEn: [
      "5 hours of effective lesson time",
      "1 hour break / buffer",
      "1 to 8 participants",
      "Schedule tailored to your needs",
      "Personalised meeting point",
      "Hotel pick-up (Full-Day)",
    ],
    season: "both",
    highlighted: true,
    sortOrder: 1,
    image: "/images/stock/product-full-day-panorama.jpg",
  },
  {
    id: "full-day-ninos",
    slug: "full-day-ninos",
    category: "full-day",
    titleEs: "Full-day niños",
    titleEn: "Full-day kids",
    shortDescriptionEs: "Clases dinámicas y divertidas. Aprende jugando.",
    shortDescriptionEn: "Dynamic, fun lessons. Learn through play.",
    descriptionEs:
      "Full-day para niños con clases dinámicas y divertidas. Formato de 5 horas de clase + 1 hora de comodín.",
    descriptionEn:
      "Full-day for children with dynamic, fun lessons. 5 hours of lesson time + 1 hour buffer.",
    disciplines: ["esqui", "snowboard"],
    hours: 6,
    minAge: 3,
    featuresEs: [
      "Aprende jugando",
      "5 h clase + 1 h comodín",
      "Instructor/a personalizado/a",
    ],
    featuresEn: [
      "Learn through play",
      "5 h lesson + 1 h buffer",
      "Dedicated instructor",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 2,
    image: "/images/stock/product-kids.jpg",
  },
  {
    id: "full-day-tour",
    slug: "full-day-tour",
    category: "full-day",
    titleEs: "Full-day tour",
    titleEn: "Full-day tour",
    shortDescriptionEs: "Conoce Sierra Nevada y mejora técnicamente.",
    shortDescriptionEn: "Discover Sierra Nevada and improve your technique.",
    descriptionEs:
      "Recorre la estación con un instructor y mejora tu técnica mientras descubres las mejores zonas de Sierra Nevada.",
    descriptionEn:
      "Explore the resort with an instructor, improve your technique and discover Sierra Nevada's best areas.",
    disciplines: ["esqui", "snowboard", "telemark"],
    hours: 6,
    featuresEs: ["Tour por la estación", "5 h clase + 1 h comodín", "Todos los niveles"],
    featuresEn: ["Resort tour", "5 h lesson + 1 h buffer", "All levels"],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 3,
    image: "/images/stock/product-tour.jpg",
  },
  {
    id: "full-day-iniciacion",
    slug: "full-day-iniciacion",
    category: "full-day",
    titleEs: "Full-day iniciación",
    titleEn: "Full-day beginners",
    shortDescriptionEs: "Tu primer día en Sierra Nevada.",
    shortDescriptionEn: "Your first day in Sierra Nevada.",
    descriptionEs:
      "Iníciate en la disciplina que prefieras con uno de nuestros instructores en tu primer día en la estación.",
    descriptionEn:
      "Start in your preferred discipline with one of our instructors on your first day at the resort.",
    disciplines: ["esqui", "snowboard", "telemark"],
    hours: 6,
    featuresEs: [
      "Primer día en la estación",
      "5 h clase + 1 h comodín",
      "Iniciación personalizada",
    ],
    featuresEn: [
      "First day at the resort",
      "5 h lesson + 1 h buffer",
      "Personalised introduction",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 4,
    image: "/images/stock/product-beginners.jpg",
  },
  {
    id: "full-day-tecnico",
    slug: "full-day-tecnico",
    category: "full-day",
    titleEs: "Full-day técnico",
    titleEn: "Full-day technical",
    shortDescriptionEs: "Vídeo correcciones y perfeccionamiento.",
    shortDescriptionEn: "Video feedback and technical coaching.",
    descriptionEs:
      "Clases técnicas con vídeo correcciones. La mejor opción para preparar pruebas de acceso o mejorar tu técnica.",
    descriptionEn:
      "Technical lessons with video feedback. The best option to prepare access tests or improve your technique.",
    disciplines: ["esqui", "snowboard", "telemark"],
    hours: 6,
    featuresEs: [
      "Vídeo correcciones",
      "Preparación pruebas de acceso",
      "5 h clase + 1 h comodín",
    ],
    featuresEn: [
      "Video feedback",
      "Access test preparation",
      "5 h lesson + 1 h buffer",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 5,
    image: "/images/stock/product-technical.jpg",
  },
  {
    id: "medio-dia",
    slug: "medio-dia",
    category: "half-day",
    titleEs: "Clases Forfait medio día",
    titleEn: "Half-day lift pass lessons",
    shortDescriptionEs: "3 h de 14:00 a 17:00.",
    shortDescriptionEn: "3 h from 2:00 to 5:00 pm.",
    descriptionEs:
      "Clases de medio día en franja de tarde. 3 horas de clase de 14:00 a 17:00. Ideal si ya tienes forfait de mañana o llegas a la estación después de comer.",
    descriptionEn:
      "Half-day lessons in the afternoon slot. 3 hours of lesson time from 2:00 to 5:00 pm. Ideal if you already have a morning lift pass or arrive at the resort after lunch.",
    disciplines: ["esqui", "snowboard", "telemark"],
    fromPrice: SESSION_3H_AFTERNOON[0],
    hours: 3,
    minPeople: 1,
    maxPeople: 8,
    scheduleEs: "14:00 – 17:00",
    scheduleEn: "2:00 – 5:00 pm",
    featuresEs: ["3 horas de clase", "Horario de tarde (14:00–17:00)", "De 1 a 8 participantes"],
    featuresEn: ["3-hour lesson", "Afternoon slot (2:00–5:00 pm)", "1 to 8 participants"],
    season: CURRENT_SEASON.key,
    highlighted: false,
    sortOrder: 7,
    image: "/images/stock/product-afternoon.jpg",
  },
  {
    id: "curso-snow",
    slug: "curso-snow",
    category: "course",
    titleEs: "Curso de Snowboard",
    titleEn: "Snowboard Course",
    shortDescriptionEs: `${CURSO_SNOW_PER_PERSON_EUR} € / persona · mínimo 3 personas.`,
    shortDescriptionEn: `€${CURSO_SNOW_PER_PERSON_EUR} / person · minimum 3 people.`,
    descriptionEs:
      `Curso de snowboard de 3 horas (10:00–13:00). ${CURSO_SNOW_PER_PERSON_EUR} € por persona. Mínimo 3 personas para realizar el curso; máximo 8.`,
    descriptionEn:
      `3-hour snowboard course (10:00–13:00). €${CURSO_SNOW_PER_PERSON_EUR} per person. Minimum 3 people required to run the course; maximum 8.`,
    disciplines: ["snowboard"],
    fromPrice: CURSO_SNOW_PER_PERSON_EUR,
    hours: 3,
    minPeople: 3,
    maxPeople: 8,
    scheduleEs: "10:00–13:00",
    scheduleEn: "10:00 am–1:00 pm",
    featuresEs: [
      "Rendimiento Asegurado",
      `${CURSO_SNOW_PER_PERSON_EUR} € / persona`,
      "Mínimo 3 personas para realizar el curso",
      "Máximo 8 personas",
      "3 horas de clase efectivas",
      "Horario 10:00–13:00",
    ],
    featuresEn: [
      "Guaranteed Progress",
      `€${CURSO_SNOW_PER_PERSON_EUR} / person`,
      "Minimum 3 people required to run the course",
      "Maximum 8 people",
      "3 hours of effective lesson time",
      "Schedule 10:00–13:00",
    ],
    season: CURRENT_SEASON.key,
    highlighted: true,
    sortOrder: 9,
    image: "/images/stock/product-snowboard-course.jpg",
  },
  {
    id: "particular",
    slug: "particular",
    category: "private",
    titleEs: "Clases particulares",
    titleEn: "Private lessons",
    shortDescriptionEs: `1 a 8 personas · desde ${HOURLY_ANCHOR_EUR} €/h (2 h estándar).`,
    shortDescriptionEn: `1 to 8 people · from €${HOURLY_ANCHOR_EUR}/h (standard 2 h).`,
    descriptionEs:
      "Clases con instructor/a de 1 a 8 participantes. Formato estándar de 2 horas (55 €/h por persona en mañana). Elige horario y disciplina.",
    descriptionEn:
      "Lessons with your instructor for 1 to 8 participants. Standard 2-hour format (€55/h per person in the morning). Choose schedule and discipline.",
    disciplines: ["esqui", "snowboard", "telemark", "esqui-adaptado"],
    fromPrice: SESSION_2H_STANDARD[0],
    minPeople: 1,
    maxPeople: 8,
    minAge: 3,
    hours: 2,
    featuresEs: [
      "1 a 8 participantes",
      "55 €/h en clase estándar de 2 h",
      "Mínimo 2 horas",
      "Todos los niveles",
      "Niños desde 3 años",
    ],
    featuresEn: [
      "1 to 8 participants",
      "€55/h for the standard 2-hour lesson",
      "2-hour minimum",
      "All levels",
      "Children from 3 years",
    ],
    season: CURRENT_SEASON.key,
    highlighted: true,
    sortOrder: 10,
    image: "/images/stock/product-private-zona.jpg",
  },
  {
    id: "curso-empresa",
    slug: "curso-empresa",
    category: "course",
    titleEs: "Cursos de 2 a 5 días",
    titleEn: "2 to 5-day courses",
    shortDescriptionEs: "Viajes de empresa, clubes deportivos y grupos. Jornada completa cada día.",
    shortDescriptionEn: "Corporate trips, sports clubs and groups. Full day each day.",
    descriptionEs:
      "Cursos de 2 a 5 días en jornada completa (10:00–16:00), especialmente diseñados para viajes de empresa, clubes deportivos y grupos. Grupo máximo 8 personas.",
    descriptionEn:
      "2 to 5-day full-day courses (10:00 am–4:00 pm), designed for corporate trips, sports clubs and groups. Maximum group size 8.",
    disciplines: ["esqui", "snowboard", "telemark"],
    fromPrice: SESSION_FULL_DAY[1],
    hours: 6,
    minPeople: 2,
    maxPeople: 8,
    scheduleEs: "10:00 – 16:00 (jornada completa)",
    scheduleEn: "10:00 am – 4:00 pm (full day)",
    featuresEs: [
      "Jornada completa cada día (10:00–16:00)",
      "De 2 a 5 días consecutivos",
      "Viajes de empresa y clubes",
      "Grupo máximo 8 personas",
      site.instructorQualificationsEs,
    ],
    featuresEn: [
      "Full day each day (10:00 am–4:00 pm)",
      "2 to 5 consecutive days",
      "Corporate trips and clubs",
      "Maximum 8 people",
      site.instructorQualificationsEn,
    ],
    season: CURRENT_SEASON.key,
    highlighted: false,
    sortOrder: 11,
    image: "/images/stock/product-corporate.jpg",
  },
];

export function getProductBySlug(slug: ProductId): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getHighlightedProducts(): Product[] {
  return products.filter((p) => p.highlighted).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products
    .filter((p) => p.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
