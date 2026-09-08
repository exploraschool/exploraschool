import { routing, getPathname } from "@/i18n/routing";
import type { AppPathname } from "@/i18n/pathnames";
import type { MainDisciplineId } from "@/data/disciplines";
import { getSiteUrl } from "@/lib/site-url";

export type Locale = (typeof routing.locales)[number];

const DISCIPLINE_PATH = {
  esqui: "/clases/esqui",
  snowboard: "/clases/snowboard",
  telemark: "/clases/telemark",
  "esqui-adaptado": "/clases/esqui-adaptado",
  ninos: "/clases/ninos",
} as const satisfies Record<MainDisciplineId, AppPathname>;

export function disciplinePath(id: MainDisciplineId): (typeof DISCIPLINE_PATH)[MainDisciplineId] {
  return DISCIPLINE_PATH[id];
}

type PathnameHref =
  | AppPathname
  | {
      pathname: "/blog/[slug]";
      params: { slug: string };
    }
  | {
      pathname: "/blog/guias/[page]";
      params: { page: string };
    }
  | {
      pathname: "/blog/productos/[page]";
      params: { page: string };
    }
  | {
      pathname: "/equipo/[slug]";
      params: { slug: string };
    };

export function localizedPath(locale: string, href: PathnameHref): string {
  return getPathname({
    locale: locale === "en" ? "en" : "es",
    href: href as Parameters<typeof getPathname>[0]["href"],
  });
}

export function localizedUrl(locale: string, href: PathnameHref): string {
  return `${getSiteUrl()}${localizedPath(locale, href)}`;
}

export function languageAlternates(href: PathnameHref): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localizedUrl(locale, href);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, href);
  return languages;
}

export function homeUrl(locale: string): string {
  return localizedUrl(locale, "/");
}

const BLOG_SECTION = new Set(["guias", "productos", "guides", "gear"]);

/** Internal pathname (`/clases/snowboard`, `/blog/foo`) → absolute public URL. */
export function publicUrl(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/" || normalized === "") return homeUrl(locale);

  const blogPage = normalized.match(/^\/blog\/(guias|productos)\/([^/]+)$/);
  if (blogPage) {
    const section = blogPage[1] as "guias" | "productos";
    return localizedUrl(locale, {
      pathname: section === "guias" ? "/blog/guias/[page]" : "/blog/productos/[page]",
      params: { page: blogPage[2] },
    });
  }
  if (normalized === "/blog/guias") return localizedUrl(locale, "/blog/guias");
  if (normalized === "/blog/productos") return localizedUrl(locale, "/blog/productos");

  const blogPost = normalized.match(/^\/blog\/([^/]+)$/);
  if (blogPost && !BLOG_SECTION.has(blogPost[1])) {
    return localizedUrl(locale, {
      pathname: "/blog/[slug]",
      params: { slug: blogPost[1] },
    });
  }

  const equipo = normalized.match(/^\/equipo\/([^/]+)$/);
  if (equipo) {
    return localizedUrl(locale, {
      pathname: "/equipo/[slug]",
      params: { slug: equipo[1] },
    });
  }

  return localizedUrl(locale, normalized as AppPathname);
}
