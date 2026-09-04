import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/data/site";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { getSiteUrl } from "@/lib/site-url";

const DEFAULT_OG = "/images/stock/hero.jpg";

type PageMeta = {
  locale: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
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
  ogImageAlt,
  ogType = "website",
  noIndex = false,
}: PageMeta): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = buildLocalizedPageUrl(siteUrl, locale, path);
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, buildLocalizedPageUrl(siteUrl, loc, path)]),
  ) as Record<string, string>;
  languages["x-default"] = buildLocalizedPageUrl(siteUrl, routing.defaultLocale, path);
  const fullTitle = title.includes("Explora") ? title : `${title} | Explora School & Club`;
  const isSpanish = locale !== "en";
  const imageAlt =
    ogImageAlt ??
    (isSpanish
      ? `${site.name} — clases de esquí y snowboard en Sierra Nevada`
      : `${site.name} — ski and snowboard lessons in Sierra Nevada`);

  return {
    title: { absolute: fullTitle },
    description,
    metadataBase: new URL(siteUrl),
    applicationName: site.name,
    authors: [{ name: site.name, url: siteUrl }],
    creator: site.name,
    publisher: site.name,
    category: isSpanish ? "Deportes de invierno" : "Winter sports",
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: ogType,
      locale: isSpanish ? "es_ES" : "en_GB",
      alternateLocale: isSpanish ? ["en_GB"] : ["es_ES"],
      url: canonical,
      siteName: site.name,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/** Metadatos por defecto (español) para el layout raíz y fallbacks. */
export function buildRootSpanishMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = `Clases de esquí y snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h | Explora School & Club`;
  const description = site.homeMetaDescriptionEs;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${site.name}`,
    },
    description,
    applicationName: site.name,
    authors: [{ name: site.name, url: siteUrl }],
    creator: site.name,
    publisher: site.name,
    category: "Deportes de invierno",
    alternates: {
      canonical: `${siteUrl}/es`,
      languages: {
        es: `${siteUrl}/es`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/es`,
      },
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      alternateLocale: ["en_GB"],
      url: `${siteUrl}/es`,
      siteName: site.name,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG,
          width: 1200,
          height: 630,
          alt: `${site.name} — clases de esquí y snowboard en Sierra Nevada`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
