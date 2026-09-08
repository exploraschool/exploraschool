import { routing } from "@/i18n/routing";
import { blogPosts } from "@/data/blog";
import { isListedEditorial, publicEditorialSlug } from "@/data/blog-urls";
import { getMainDisciplines } from "@/data/disciplines";
import { listPublishedAffiliatePosts } from "@/lib/affiliate-blog";
import { disciplinePath, publicUrl } from "@/lib/seo-urls";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapRoute = {
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  lastModified?: Date;
  /** If set, each locale uses this function to pick the public path. */
  pathForLocale?: (locale: string) => string;
};

const STATIC_ROUTES: SitemapRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/clases", changeFrequency: "weekly", priority: 0.9 },
  { path: "/reserva", changeFrequency: "weekly", priority: 0.9 },
  { path: "/club", changeFrequency: "monthly", priority: 0.8 },
  { path: "/como-llegar", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/blog/guias", changeFrequency: "weekly", priority: 0.65 },
  { path: "/blog/productos", changeFrequency: "weekly", priority: 0.65 },
  { path: "/preguntas-frecuentes", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "monthly", priority: 0.7 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-cookies", changeFrequency: "yearly", priority: 0.3 },
];

function disciplineRoutes(): SitemapRoute[] {
  return getMainDisciplines().map((d) => ({
    path: disciplinePath(d.id),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
}

async function blogPostRoutes(): Promise<SitemapRoute[]> {
  const editorial: SitemapRoute[] = blogPosts
    .filter((post) => isListedEditorial(post.slug))
    .map((post) => ({
      path: `/blog/${publicEditorialSlug(post.slug, "es")}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: new Date(post.date),
      pathForLocale: (locale: string) => `/blog/${publicEditorialSlug(post.slug, locale)}`,
    }));
  let affiliate: SitemapRoute[] = [];
  try {
    const posts = await Promise.race([
      listPublishedAffiliatePosts(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 8000);
      }),
    ]);
    affiliate = posts.map((post) => ({
      path: `/blog/${post.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.55,
      lastModified: new Date(post.publishedAt || post.updatedAt),
      pathForLocale: (locale: string) =>
        `/blog/${locale === "en" ? post.slugEn || post.slug : post.slug}`,
    }));
  } catch {
    affiliate = [];
  }
  return [...editorial, ...affiliate];
}

export async function getSitemapRoutes(): Promise<SitemapRoute[]> {
  return [...STATIC_ROUTES, ...disciplineRoutes(), ...(await blogPostRoutes())];
}

export function buildLocalizedUrl(locale: string, path: string): string {
  return publicUrl(locale, path);
}

export function buildLanguageAlternates(
  route: SitemapRoute,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const path = route.pathForLocale?.(locale) ?? route.path;
    languages[locale] = publicUrl(locale, path);
  }
  return languages;
}
