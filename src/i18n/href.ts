import type { ComponentProps } from "react";
import { Link } from "./routing";
import { EDITORIAL_SEO, publicEditorialSlug } from "@/data/blog-urls";

export type AppHref = ComponentProps<typeof Link>["href"];

/** CMS/markdown/query strings that next-intl cannot infer at compile time. */
export function toHref(href: string): AppHref {
  return href as AppHref;
}

export function blogHref(slug: string) {
  return { pathname: "/blog/[slug]" as const, params: { slug } };
}

export function equipoHref(slug: string) {
  return { pathname: "/equipo/[slug]" as const, params: { slug } };
}

function editorialPublicSlug(slug: string, locale: string): string | null {
  if (EDITORIAL_SEO[slug]) return publicEditorialSlug(slug, locale);
  for (const [identity, seo] of Object.entries(EDITORIAL_SEO)) {
    if (seo.slug === slug || seo.slugEn === slug || seo.legacySlugs.includes(slug)) {
      return publicEditorialSlug(identity, locale);
    }
  }
  return null;
}

/** Language switcher href: dynamic routes need the current params. */
export function localeSwitchHref(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
  targetLocale = "es",
): AppHref {
  if (pathname === "/blog/[slug]") {
    const raw = params.slug;
    const slug = Array.isArray(raw) ? raw[0] : raw;
    if (slug) {
      return blogHref(editorialPublicSlug(slug, targetLocale) ?? slug);
    }
  }
  if (!pathname.includes("[")) return pathname as AppHref;
  const routeParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === "locale" || value == null) continue;
    routeParams[key] = Array.isArray(value) ? value[0] : value;
  }
  return { pathname, params: routeParams } as AppHref;
}
