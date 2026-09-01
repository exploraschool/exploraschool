import type { DisciplineId } from "./disciplines";

export type ProductId =
  | "full-day"
  | "full-day-ninos"
  | "full-day-tour"
  | "full-day-iniciacion"
  | "full-day-tecnico"
  | "primeras-huellas"
  | "medio-dia"
  | "clase-grabada"
  | "curso-snow"
  | "particular"
  | "curso-empresa"
  | "grupal";

export type ProductCategory =
  | "full-day"
  | "half-day"
  | "course"
  | "private"
  | "group"
  | "extra";

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
  season: "current-2025-26" | "legacy-2022" | "both";
  highlighted: boolean;
  sortOrder: number;
  /** @pending Photo pending — upload to public/images/legacy/product-{slug}.webp */
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
    disciplines: ["esqui", "snowboard", "telemark", "esqui-adaptado", "freestyle", "freeride"],
    fromPrice: 160,
    hours: 6,
    featuresEs: [
      "5 horas de clase efectivas",
      "1 hora de descanso / comodín",
      "+25 € por persona extra (temporada actual)",
      "Horario ajustado a tus necesidades",
      "Punto de encuentro personalizado",
      "Recogida en hotel (Full-Day)",
    ],
    featuresEn: [
      "5 hours of effective lesson time",
      "1 hour break / buffer",
      "+€25 per extra person (current season)",
      "Schedule tailored to your needs",
      "Personalised meeting point",
      "Hotel pick-up (Full-Day)",
    ],
    season: "both",
    highlighted: true,
    sortOrder: 1,
    // pending: product-full-day.webp
    image: "/images/legacy/product-full-day.webp",
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
    // pending: product-full-day-ninos.webp
    image: "/images/legacy/product-full-day-ninos.webp",
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
    // pending: product-full-day-tour.webp
    image: "/images/legacy/product-full-day-tour.webp",
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
    // pending: product-full-day-iniciacion.webp
    image: "/images/legacy/product-full-day-iniciacion.webp",
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
    // pending: product-full-day-tecnico.webp
    image: "/images/legacy/product-full-day-tecnico.webp",
  },
  {
    id: "primeras-huellas",
    slug: "primeras-huellas",
    category: "half-day",
    titleEs: "Primeras Huellas",
    titleEn: "Primeras Huellas",
    shortDescriptionEs: "3 h por la mañana. Pista recién pisada, sin colas.",
    shortDescriptionEn: "3 h morning session. Fresh slopes, no queues.",
    descriptionEs:
      "Aprovecha a primera hora para empezar el día con la pista recién pisada y sin colas. Déjate guiar por uno de nuestros instructores.",
    descriptionEn:
      "Make the most of the morning with freshly groomed slopes and no queues. Let one of our instructors guide you.",
    disciplines: ["esqui", "snowboard", "telemark"],
    fromPrice: 110,
    hours: 3,
    scheduleEs: "9:00–12:00",
    scheduleEn: "9:00 am–12:00 pm",
    featuresEs: ["3 horas de clase", "Horario 9:00–12:00", "Primera hora de la mañana"],
    featuresEn: ["3-hour lesson", "9:00 am–12:00 pm", "Early morning slot"],
    season: "legacy-2022",
    highlighted: true,
    sortOrder: 6,
    // pending: product-primeras-huellas.webp
    image: "/images/legacy/product-primeras-huellas.webp",
  },
  {
    id: "medio-dia",
    slug: "medio-dia",
    category: "half-day",
    titleEs: "Clases Forfait medio día",
    titleEn: "Half-day lift pass lessons",
    shortDescriptionEs: "2 h a partir de las 13:00.",
    shortDescriptionEn: "2 h from 1:00 pm.",
    descriptionEs:
      "Si llegas tarde a la estación o no te gusta madrugar, esta es tu opción. Clases de 2 horas a partir de la tarde.",
    descriptionEn:
      "If you arrive late or prefer not to get up early, this is your option. 2-hour lessons from the afternoon.",
    disciplines: ["esqui", "snowboard", "telemark"],
    fromPrice: 65,
    hours: 2,
    scheduleEs: "A partir de las 13:00",
    scheduleEn: "From 1:00 pm",
    featuresEs: ["2 horas de clase", "Turno de tarde", "Ideal si llegas tarde"],
    featuresEn: ["2-hour lesson", "Afternoon slot", "Ideal if you arrive late"],
    season: "legacy-2022",
    highlighted: true,
    sortOrder: 7,
    // pending: product-medio-dia.webp
    image: "/images/legacy/product-medio-dia.webp",
  },
  {
    id: "clase-grabada",
    slug: "clase-grabada",
    category: "extra",
    titleEs: "Clase grabada",
    titleEn: "Recorded lesson",
    shortDescriptionEs: "Vídeo correcciones. Llévate un recuerdo de tu día.",
    shortDescriptionEn: "Video feedback. Take home a memory of your day.",
    descriptionEs:
      "Sesión con vídeo correcciones para analizar tu técnica y llevarte un recuerdo de tu día en la nieve.",
    descriptionEn:
      "Session with video feedback to analyse your technique and take home a memory of your day on the snow.",
    disciplines: ["esqui", "snowboard", "telemark"],
    fromPrice: 20,
    featuresEs: ["Vídeo correcciones", "Recuerdo de tu día en la nieve"],
    featuresEn: ["Video feedback", "Memory of your day on the snow"],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 8,
    // pending: product-clase-grabada.webp
    image: "/images/legacy/product-clase-grabada.webp",
  },
  {
    id: "curso-snow",
    slug: "curso-snow",
    category: "course",
    titleEs: "Curso de Snowboard",
    titleEn: "Snowboard Course",
    shortDescriptionEs: "Rendimiento Asegurado — 60 € / persona.",
    shortDescriptionEn: "Guaranteed Progress — €60 / person.",
    descriptionEs:
      "Curso de snowboard de 3 horas para grupos de 3 a 6 personas. Horario 10:00–13:00.",
    descriptionEn:
      "3-hour snowboard course for groups of 3 to 6 people. Schedule 10:00–13:00.",
    disciplines: ["snowboard"],
    fromPrice: 60,
    hours: 3,
    minPeople: 3,
    maxPeople: 6,
    scheduleEs: "10:00–13:00",
    scheduleEn: "10:00 am–1:00 pm",
    featuresEs: [
      "Rendimiento Asegurado",
      "60 € / persona",
      "De 3 a 6 personas",
      "3 horas de clase efectivas",
    ],
    featuresEn: [
      "Guaranteed Progress",
      "€60 / person",
      "3 to 6 people",
      "3 hours of effective lesson time",
    ],
    season: "current-2025-26",
    highlighted: true,
    sortOrder: 9,
    // pending: product-curso-snow.webp
    image: "/images/legacy/product-curso-snow.webp",
  },
  {
    id: "particular",
    slug: "particular",
    category: "private",
    titleEs: "Clases particulares",
    titleEn: "Private lessons",
    shortDescriptionEs: "1 a 4 personas. Mínimo 2 horas. Niños desde 3 años.",
    shortDescriptionEn: "1 to 4 people. 2-hour minimum. Children from 3 years.",
    descriptionEs:
      "Clases particulares de 1 a 4 personas con mínimo de 2 horas. Todos los niveles. Elige instructor/a y horario.",
    descriptionEn:
      "Private lessons for 1 to 4 people with a 2-hour minimum. All levels. Choose your instructor and schedule.",
    disciplines: ["esqui", "snowboard", "telemark", "esqui-adaptado", "freestyle", "freeride"],
    minPeople: 1,
    maxPeople: 4,
    minAge: 3,
    hours: 2,
    featuresEs: [
      "1 a 4 personas",
      "Mínimo 2 horas",
      "Todos los niveles",
      "Niños desde 3 años",
    ],
    featuresEn: [
      "1 to 4 people",
      "2-hour minimum",
      "All levels",
      "Children from 3 years",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 10,
    // pending: product-particular.webp
    image: "/images/legacy/product-particular.webp",
  },
  {
    id: "curso-empresa",
    slug: "curso-empresa",
    category: "course",
    titleEs: "Cursos de 2 a 5 días",
    titleEn: "2 to 5-day courses",
    shortDescriptionEs: "Viajes de empresa, clubes deportivos y grupos.",
    shortDescriptionEn: "Corporate trips, sports clubs and groups.",
    descriptionEs:
      "Cursos de 2 a 5 días especialmente diseñados para viajes de empresa, clubes deportivos y grupos. Grupo máximo 8 personas.",
    descriptionEn:
      "2 to 5-day courses designed for corporate trips, sports clubs and groups. Maximum group size 8.",
    disciplines: ["esqui", "snowboard", "telemark"],
    minPeople: 2,
    maxPeople: 8,
    featuresEs: [
      "De 2 a 5 días",
      "Viajes de empresa y clubes",
      "Grupo máximo 8 personas",
      "Licenciados INEF, TECO, TAFAD",
    ],
    featuresEn: [
      "2 to 5 days",
      "Corporate trips and clubs",
      "Maximum 8 people",
      "Qualified INEF, TECO, TAFAD instructors",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 11,
    // pending: product-curso-empresa.webp
    image: "/images/legacy/product-curso-empresa.webp",
  },
  {
    id: "grupal",
    slug: "grupal",
    category: "group",
    titleEs: "Clases grupales",
    titleEn: "Group lessons",
    shortDescriptionEs: "5 a 8 personas. Mínimo aconsejado 3 horas. Niños desde 6 años.",
    shortDescriptionEn: "5 to 8 people. 3-hour minimum recommended. Children from 6.",
    descriptionEs:
      "Clases grupales de 5 a 8 personas. Queremos ofrecerte clases de calidad, por lo que el grupo nunca excederá de 8 personas.",
    descriptionEn:
      "Group lessons for 5 to 8 people. We never exceed 8 people to ensure quality.",
    disciplines: ["esqui", "snowboard", "telemark"],
    minPeople: 5,
    maxPeople: 8,
    minAge: 6,
    hours: 3,
    featuresEs: [
      "5 a 8 personas",
      "Mínimo aconsejado 3 horas",
      "Todos los niveles",
      "Niños desde 6 años",
    ],
    featuresEn: [
      "5 to 8 people",
      "3-hour minimum recommended",
      "All levels",
      "Children from 6 years",
    ],
    season: "legacy-2022",
    highlighted: false,
    sortOrder: 12,
    // pending: product-grupal.webp
    image: "/images/legacy/product-grupal.webp",
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
