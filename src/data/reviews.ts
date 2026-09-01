export type ReviewSource = "tripadvisor" | "web";

export type Review = {
  id: string;
  author: string;
  date: string;
  location?: string;
  textEs: string;
  textEn: string;
  instructor?: string;
  source: ReviewSource;
  featured: boolean;
  sortOrder: number;
};

export const reviews: Review[] = [
  {
    id: "vicent-feb-2022",
    author: "Vicent",
    date: "2022-02",
    textEs:
      "Primera vez esquiando. Jorge es un crack: me sentí cómodo desde el principio y aprendí muchísimo en un solo día.",
    textEn:
      "First time skiing. Jorge is amazing: I felt comfortable from the start and learned a huge amount in a single day.",
    instructor: "Jorge",
    source: "tripadvisor",
    featured: true,
    sortOrder: 1,
  },
  {
    id: "love2908-feb-2022",
    author: "love2908",
    date: "2022-02",
    textEs:
      "Trato 10, clases dinámicas y divertidas. Sois la caña, equipo Explora.",
    textEn:
      "Top-notch service, dynamic and fun lessons. You guys are awesome, Explora team.",
    source: "tripadvisor",
    featured: true,
    sortOrder: 2,
  },
  {
    id: "nataliagmm-ene-2022",
    author: "NataliaGgmm",
    date: "2022-01",
    location: "Málaga",
    textEs:
      "Competentes, cualificados y muy agradables. Aprenden rápido. Repetiremos.",
    textEn:
      "Competent, qualified and very friendly. You learn fast. We will come back.",
    source: "tripadvisor",
    featured: true,
    sortOrder: 3,
  },
  {
    id: "adventurer582950-feb-2022",
    author: "Adventurer582950",
    date: "2022-02",
    textEs:
      "Profesionales, trato personal y clases amenas. Jorge un grande.",
    textEn:
      "Professional, personal attention and enjoyable lessons. Jorge is great.",
    instructor: "Jorge",
    source: "tripadvisor",
    featured: true,
    sortOrder: 4,
  },
  {
    id: "manuel-f-ene-2022",
    author: "Manuel F",
    date: "2022-01",
    location: "Málaga",
    textEs:
      "Perfeccionamiento con Lalo. ESPECTACULAR. Técnico y docente: pregunta objetivos, evalúa nivel y organiza la sesión.",
    textEn:
      "Advanced coaching with Lalo. SPECTACULAR. Technical and pedagogical: asks your goals, assesses your level and structures the session.",
    instructor: "Lalo",
    source: "tripadvisor",
    featured: true,
    sortOrder: 5,
  },
  {
    id: "raul-s-ene-2022",
    author: "Raúl S",
    date: "2022-01",
    textEs:
      "Profesionalidad total. Los niños encantados y los adultos aún más. Hay que reservar con tiempo, no dan abasto.",
    textEn:
      "Total professionalism. The kids loved it and the adults even more. Book well in advance — they are in high demand.",
    source: "tripadvisor",
    featured: true,
    sortOrder: 6,
  },
  {
    id: "isabel-m-dic-2021",
    author: "Isabel M",
    date: "2021-12",
    location: "Albacete",
    textEs:
      "Información clara por teléfono. Patri súper profesional, paciente con adultos y crack con el adolescente.",
    textEn:
      "Clear information by phone. Patri is super professional, patient with adults and brilliant with the teenager.",
    instructor: "Patri",
    source: "tripadvisor",
    featured: true,
    sortOrder: 7,
  },
  {
    id: "antonio-f-dic-2021",
    author: "Antonio F",
    date: "2021-12",
    textEs: "Snowboard iniciación con Lalo, inmejorable.",
    textEn: "Beginner snowboard with Lalo, unbeatable.",
    instructor: "Lalo",
    source: "tripadvisor",
    featured: true,
    sortOrder: 8,
  },
  {
    id: "alex-m-2021",
    author: "Alex M",
    date: "2021",
    textEs:
      "Clases de Jorge: la mejor inversión. Sin ellas no habría seguido esquiando.",
    textEn:
      "Lessons with Jorge: the best investment. Without them I wouldn't have kept skiing.",
    instructor: "Jorge",
    source: "tripadvisor",
    featured: true,
    sortOrder: 9,
  },
  {
    id: "carmen-feb-2021",
    author: "Carmen",
    date: "2021-02",
    textEs:
      "De no saber nada a poder esquiar solos en una clase. Gracias, Esaú.",
    textEn:
      "From knowing nothing to skiing on our own in one lesson. Thank you, Esaú.",
    instructor: "Esaú",
    source: "tripadvisor",
    featured: true,
    sortOrder: 10,
  },
];

export const tripAdvisorSummary = {
  rating: 5.0,
  reviewCount: 18,
  source: "tripadvisor" as const,
};

export function getFeaturedReviews(): Review[] {
  return reviews.filter((r) => r.featured).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getReviewsByInstructor(name: string): Review[] {
  return reviews.filter(
    (r) => r.instructor?.toLowerCase() === name.toLowerCase(),
  );
}
