import { routing } from "@/i18n/routing";
import { blogPosts } from "@/data/blog";
import { getMainDisciplines } from "@/data/disciplines";
import { listPublishedAffiliatePosts } from "@/lib/affiliate-blog";
import { getSiteUrl } from "@/lib/site-url";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapRoute = {
  /** Path without locale prefix, e.g. "" for home or "/clases". */
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  lastModified?: Date;
};

const STATIC_ROUTES: SitemapRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/clases", changeFrequency: "weekly", priority: 0.9 },
  { path: "/reserva", changeFrequency: "weekly", priority: 0.9 },
  { path: "/club", changeFrequency: "monthly", priority: 0.8 },
  { path: "/como-llegar", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/preguntas-frecuentes", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "monthly", priority: 0.7 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-cookies", changeFrequency: "yearly", priority: 0.3 },
];

function disciplineRoutes(): SitemapRoute[] {
  return getMainDisciplines().map((d) => ({
    path: `/clases/${d.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
}

async function blogPostRoutes(): Promise<SitemapRoute[]> {
  const editorial = blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: new Date(post.date),
  }));
  let affiliate: SitemapRoute[] = [];
  try {
    affiliate = (await listPublishedAffiliatePosts()).map((post) => ({
      path: `/blog/${post.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.55,
      lastModified: new Date(post.publishedAt || post.updatedAt),
    }));
  } catch {
    affiliate = [];
  }
  return [...editorial, ...affiliate];
}

export async function getSitemapRoutes(): Promise<SitemapRoute[]> {
  return [...STATIC_ROUTES, ...disciplineRoutes(), ...(await blogPostRoutes())];
}

/** Build absolute URL for a locale + path (default locale is Spanish). */
export function buildLocalizedUrl(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getSiteUrl()}/${locale}${normalized}`;
}

/** hreflang map for all configured locales plus x-default. */
export function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale] = buildLocalizedUrl(locale, path);
  }

  languages["x-default"] = buildLocalizedUrl(routing.defaultLocale, path);

  return languages;
}
