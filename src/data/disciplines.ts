export type DisciplineId =
  | "esqui"
  | "snowboard"
  | "telemark"
  | "esqui-adaptado"
  | "freestyle"
  | "freeride"
  | "ninos";

export type Discipline = {
  id: DisciplineId;
  slug: DisciplineId;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  /** @pending Photo pending — upload to public/images/legacy/ */
  image: string;
  sortOrder: number;
};

export const disciplines: Discipline[] = [
  {
    id: "esqui",
    slug: "esqui",
    nameEs: "Esquí alpino",
    nameEn: "Alpine skiing",
    descriptionEs:
      "Clases particulares y grupales para todas las edades y niveles en Sierra Nevada.",
    descriptionEn:
      "Private and group lessons for all ages and levels in Sierra Nevada.",
    // pending: icon-ski.png from legacy scrape
    image: "/images/legacy/icon-ski.webp",
    sortOrder: 1,
  },
  {
    id: "snowboard",
    slug: "snowboard",
    nameEs: "Snowboard",
    nameEn: "Snowboard",
    descriptionEs:
      "Desde iniciación hasta perfeccionamiento técnico con instructores especializados.",
    descriptionEn:
      "From first turns to technical coaching with specialist instructors.",
    // pending: icon-glasses-snow.png from legacy scrape
    image: "/images/legacy/icon-glasses-snow.webp",
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
    // pending: discipline photo not yet scraped
    image: "/images/legacy/discipline-telemark.webp",
    sortOrder: 3,
  },
  {
    id: "esqui-adaptado",
    slug: "esqui-adaptado",
    nameEs: "Esquí adaptado",
    nameEn: "Adaptive skiing",
    descriptionEs:
      "Clases inclusivas y personalizadas para disfrutar de la nieve con seguridad.",
    descriptionEn:
      "Inclusive, personalised lessons to enjoy the snow safely.",
    // pending: discipline photo not yet scraped
    image: "/images/legacy/discipline-esqui-adaptado.webp",
    sortOrder: 4,
  },
  {
    id: "freestyle",
    slug: "freestyle",
    nameEs: "Freestyle",
    nameEn: "Freestyle",
    descriptionEs:
      "Trucos, saltos y progresión en snowpark con enfoque técnico y seguro.",
    descriptionEn:
      "Tricks, jumps and snowpark progression with a safe, technical approach.",
    // pending: discipline photo not yet scraped
    image: "/images/legacy/discipline-freestyle.webp",
    sortOrder: 5,
  },
  {
    id: "freeride",
    slug: "freeride",
    nameEs: "Freeride",
    nameEn: "Freeride",
    descriptionEs:
      "Explora fuera de pista y descubre todo lo que la alta montaña de Sierra Nevada ofrece.",
    descriptionEn:
      "Explore off-piste terrain and discover what Sierra Nevada's high mountains have to offer.",
    // pending: discipline photo not yet scraped
    image: "/images/legacy/discipline-freeride.webp",
    sortOrder: 6,
  },
  {
    id: "ninos",
    slug: "ninos",
    nameEs: "Clases para niños",
    nameEn: "Kids lessons",
    descriptionEs:
      "Particulares desde 3 años, grupales desde 6. Clases dinámicas y divertidas para aprender jugando.",
    descriptionEn:
      "Private from age 3, group from age 6. Fun, dynamic lessons where children learn through play.",
    image: "/images/legacy/discipline-ninos.webp",
    sortOrder: 7,
  },
];

export function getDisciplineBySlug(slug: DisciplineId): Discipline | undefined {
  return disciplines.find((d) => d.slug === slug);
}
