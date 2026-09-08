import type { AppPathname } from "@/i18n/pathnames";

export type EditorialSeo = {
  /** Canonical Spanish slug (may differ from the data key). */
  slug: string;
  slugEn: string;
  legacySlugs: string[];
  /** If set, the post 308s to this internal pathname and is omitted from the blog index. */
  redirectTo?: AppPathname;
  /** SERP title. Falls back to the on-page H1. */
  seoTitleEs?: string;
  seoTitleEn?: string;
  seoDescriptionEs?: string;
  seoDescriptionEn?: string;
};

/** Key = current `blogPosts[].slug` identity in data/blog.ts */
export const EDITORIAL_SEO: Record<string, EditorialSeo> = {
  "consejos-primera-vez-sierra-nevada": {
    slug: "primera-vez-esqui-sierra-nevada",
    slugEn: "first-time-skiing-sierra-nevada",
    legacySlugs: ["consejos-primera-vez-sierra-nevada"],
    seoTitleEs: "Primera vez esquiando en Sierra Nevada",
    seoTitleEn: "First time skiing in Sierra Nevada",
    seoDescriptionEs:
      "Guía para tu primera vez en Sierra Nevada: qué reservar, cómo vestirte, punto de encuentro y por qué coger clases de esquí o snowboard.",
    seoDescriptionEn:
      "A practical guide for first-time skiing in Sierra Nevada: what to book, what to wear, the meeting point and why lessons help.",
  },
  "por-que-contratar-clases-esqui-snowboard": {
    slug: "por-que-contratar-clases-esqui-snowboard",
    slugEn: "why-book-ski-snowboard-lessons",
    legacySlugs: ["por-que-es-necesario-contratar-clases-de-esqui-o-snowboard"],
    seoTitleEs: "Por qué coger clases de esquí en Sierra Nevada",
    seoTitleEn: "Why book ski lessons in Sierra Nevada",
    seoDescriptionEs:
      "Seis razones para reservar clases de esquí o snowboard en Sierra Nevada: más progreso, menos caídas, más seguridad y mejor uso del forfait.",
    seoDescriptionEn:
      "Six reasons to book ski or snowboard lessons in Sierra Nevada: faster progress, fewer falls, more safety and better use of your lift pass.",
  },
  "que-tipo-clases-elegir-sierra-nevada": {
    slug: "que-tipo-clases-elegir-sierra-nevada",
    slugEn: "which-ski-lesson-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Qué tipo de clase elegir en Sierra Nevada",
    seoTitleEn: "Which ski lesson to choose in Sierra Nevada",
    seoDescriptionEs:
      "Particular, medio día, jornada completa o curso de snowboard en Sierra Nevada: elige formato según nivel, grupo y presupuesto.",
    seoDescriptionEn:
      "Private, half-day, full-day or group snowboard lessons in Sierra Nevada: pick the format for your level, group and budget.",
  },
  "clases-esqui-ninos-sierra-nevada": {
    slug: "clases-esqui-ninos-sierra-nevada",
    slugEn: "kids-ski-lessons-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Clases de esquí para niños en Sierra Nevada",
    seoTitleEn: "Kids ski lessons in Sierra Nevada",
    seoDescriptionEs:
      "Clases de esquí y snowboard para niños en Sierra Nevada desde los 3 años: seguridad, grupos reducidos y consejos para padres.",
    seoDescriptionEn:
      "Kids ski and snowboard lessons in Sierra Nevada from age 3: safety, small groups and practical tips for parents.",
  },
  "esqui-o-snowboard-cual-elegir": {
    slug: "esqui-o-snowboard-sierra-nevada",
    slugEn: "ski-or-snowboard-sierra-nevada",
    legacySlugs: ["esqui-o-snowboard-cual-elegir"],
    seoTitleEs: "Esquí o snowboard en Sierra Nevada",
    seoTitleEn: "Ski or snowboard in Sierra Nevada",
    seoDescriptionEs:
      "¿Esquí o snowboard en Sierra Nevada? Comparamos ambas disciplinas para elegir según tu perfil, objetivos y estilo de viaje.",
    seoDescriptionEn:
      "Ski or snowboard in Sierra Nevada? We compare both so you can choose by fitness, goals and the kind of day you want.",
  },
  "normas-seguridad-pista-esqui": {
    slug: "seguridad-esqui-snowboard-sierra-nevada",
    slugEn: "ski-snowboard-safety-sierra-nevada",
    legacySlugs: ["normas-seguridad-pista-esqui"],
    seoTitleEs: "Seguridad en pista en Sierra Nevada",
    seoTitleEn: "Ski safety rules in Sierra Nevada",
    seoDescriptionEs:
      "10 normas de seguridad para esquiar y hacer snowboard en Sierra Nevada: prioridad, velocidad, material y respeto en pista.",
    seoDescriptionEn:
      "Ski and snowboard safety in Sierra Nevada: 10 slope rules on priority, speed, equipment and respect before you ride.",
  },
  "que-llevar-primer-dia-nieve": {
    slug: "que-llevar-esqui-sierra-nevada",
    slugEn: "what-to-pack-skiing-sierra-nevada",
    legacySlugs: ["que-llevar-primer-dia-nieve", "como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada"],
    seoTitleEs: "Qué llevar a esquiar en Sierra Nevada",
    seoTitleEn: "What to pack for skiing in Sierra Nevada",
    seoDescriptionEs:
      "Lista de qué llevar a esquiar o hacer snowboard en Sierra Nevada: ropa en capas, gafas, protector solar y extras del primer día.",
    seoDescriptionEn:
      "What to pack for skiing or snowboarding in Sierra Nevada: layers, goggles, sunscreen and extras for your first day.",
  },
  "esqui-adaptado-sierra-nevada": {
    slug: "esqui-adaptado-sierra-nevada",
    slugEn: "adaptive-skiing-sierra-nevada",
    legacySlugs: [],
    redirectTo: "/clases/esqui-adaptado",
  },
  "club-creando-aventuras-jovenes-sierra-nevada": {
    slug: "club-creando-aventuras-jovenes-sierra-nevada",
    slugEn: "youth-ski-club-sierra-nevada",
    legacySlugs: [],
    redirectTo: "/club",
  },
  "freeride-freestyle-telemark-sierra-nevada": {
    slug: "freeride-sierra-nevada",
    slugEn: "freeride-sierra-nevada",
    legacySlugs: ["freeride-freestyle-telemark-sierra-nevada"],
    seoTitleEs: "Freeride y freestyle en Sierra Nevada",
    seoTitleEn: "Freeride and freestyle in Sierra Nevada",
    seoDescriptionEs:
      "Freeride, freestyle y telemark en Sierra Nevada: cómo pasar de pista a fuera de pista, snowpark y talón libre con un instructor.",
    seoDescriptionEn:
      "Freeride, freestyle and telemark in Sierra Nevada: leave the piste for off-piste, snowpark and free-heel with an instructor.",
  },
  "como-elegir-gafas-esqui-snowboard": {
    slug: "gafas-esqui-snowboard-sierra-nevada",
    slugEn: "ski-goggles-sierra-nevada",
    legacySlugs: [
      "como-elegir-gafas-esqui-snowboard",
      "las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada",
    ],
    seoTitleEs: "Gafas de esquí y snowboard para Sierra Nevada",
    seoTitleEn: "Ski goggles for Sierra Nevada",
    seoDescriptionEs:
      "Cómo elegir gafas de esquí y snowboard para Sierra Nevada: lentes, categoría, ajuste y cuidados para sol, niebla y ventisca.",
    seoDescriptionEn:
      "How to choose ski and snowboard goggles for Sierra Nevada: lenses, category, fit and care for sun, fog and wind.",
  },
  "esquiar-en-familia-sierra-nevada": {
    slug: "esquiar-en-familia-sierra-nevada",
    slugEn: "family-skiing-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Esquiar en familia en Sierra Nevada",
    seoTitleEn: "Family skiing in Sierra Nevada",
    seoDescriptionEs:
      "Esquiar en familia en Sierra Nevada: planifica el viaje con niños, clases, horarios equilibrados y días sin estrés en la estación.",
    seoDescriptionEn:
      "Family skiing in Sierra Nevada: how to plan a trip with children, lessons, balanced days and less stress at the resort.",
  },
  "cursos-esqui-empresas-sierra-nevada": {
    slug: "cursos-esqui-empresas-sierra-nevada",
    slugEn: "corporate-ski-courses-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Cursos de esquí para empresas en Sierra Nevada",
    seoTitleEn: "Corporate ski courses in Sierra Nevada",
    seoDescriptionEs:
      "Cursos de esquí para empresas en Sierra Nevada: team building en la nieve, grupos reducidos e instructores titulados.",
    seoDescriptionEn:
      "Corporate ski courses in Sierra Nevada: snow team building, small groups and qualified instructors for your company trip.",
  },
  "como-llegar-sierra-nevada-guia": {
    slug: "como-llegar-sierra-nevada-guia",
    slugEn: "how-to-get-to-sierra-nevada",
    legacySlugs: ["colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos"],
    redirectTo: "/como-llegar",
  },
  "forfait-sierra-nevada-guia-compra": {
    slug: "forfait-sierra-nevada-guia-compra",
    slugEn: "sierra-nevada-lift-pass-guide",
    legacySlugs: [],
    seoTitleEs: "Forfait de Sierra Nevada: guía de compra",
    seoTitleEn: "Sierra Nevada lift pass: a buying guide",
    seoDescriptionEs:
      "Forfait Sierra Nevada: dónde comprarlo (online, cajeros o Plaza de Andalucía), qué tipo necesitas para tu clase y errores a evitar.",
    seoDescriptionEn:
      "Sierra Nevada lift pass: where to buy it, which type you need for your lesson, accident insurance and mistakes to avoid.",
  },
  "freestyle-sierra-nevada": {
    slug: "freestyle-sierra-nevada",
    slugEn: "freestyle-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Clases de freestyle en Sierra Nevada",
    seoTitleEn: "Freestyle lessons in Sierra Nevada",
    seoDescriptionEs:
      "Clases de freestyle en Sierra Nevada: saltos, rails y boxes en el snowpark, con método y un instructor para progresar con seguridad.",
    seoDescriptionEn:
      "Freestyle lessons in Sierra Nevada: jumps, rails and boxes in the snowpark, with a method and an instructor to progress safely.",
  },
  "telemark-sierra-nevada": {
    slug: "telemark-sierra-nevada",
    slugEn: "telemark-lessons-sierra-nevada",
    legacySlugs: [],
    seoTitleEs: "Clases de telemark en Sierra Nevada",
    seoTitleEn: "Telemark lessons in Sierra Nevada",
    seoDescriptionEs:
      "Clases de telemark en Sierra Nevada: talón libre, giro característico y cómo empezar con un instructor especializado. Reserva online.",
    seoDescriptionEn:
      "Telemark lessons in Sierra Nevada: free-heel technique, the classic turn and how to start with a specialist instructor. Book online.",
  },
};

export function editorialSeo(identitySlug: string): EditorialSeo {
  return (
    EDITORIAL_SEO[identitySlug] ?? {
      slug: identitySlug,
      slugEn: identitySlug,
      legacySlugs: [],
    }
  );
}

export function publicEditorialSlug(identitySlug: string, locale: string): string {
  const seo = editorialSeo(identitySlug);
  return locale === "en" ? seo.slugEn : seo.slug;
}

export function isListedEditorial(identitySlug: string): boolean {
  return !editorialSeo(identitySlug).redirectTo;
}
