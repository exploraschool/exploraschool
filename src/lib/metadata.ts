import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";

const DEFAULT_OG = "/images/logo-512.png";

type PageMeta = {
  locale: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
};

function buildLocalizedPageUrl(siteUrl: string, locale: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathSuffix = normalizedPath === "/" ? "" : normalizedPath;
  return `${siteUrl}/${locale}${pathSuffix}`;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  ogImage = DEFAULT_OG,
  noIndex = false,
}: PageMeta): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = buildLocalizedPageUrl(siteUrl, locale, path);
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, buildLocalizedPageUrl(siteUrl, loc, path)]),
  ) as Record<string, string>;
  languages["x-default"] = buildLocalizedPageUrl(siteUrl, routing.defaultLocale, path);
  const fullTitle = title.includes("Explora") ? title : `${title} | Explora School & Club`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_GB",
      alternateLocale: locale === "es" ? ["en_GB"] : ["es_ES"],
      url: canonical,
      siteName: site.name,
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
