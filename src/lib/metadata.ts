import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";
import { publicUrl } from "@/lib/seo-urls";

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
  pathForLocale?: (locale: string) => string;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  ogImage = DEFAULT_OG,
  ogImageAlt,
  ogType = "website",
  noIndex = false,
  pathForLocale,
  publishedTime,
  modifiedTime,
}: PageMeta): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = publicUrl(locale, pathForLocale?.(locale) ?? path);
  const languages = languageAlternatesFromPath(path, pathForLocale);
  const branded = `${title} | Explora School & Club`;
  const fullTitle =
    title.includes("Explora") || branded.length > 62 ? title : branded;
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
      ...(ogType === "article" && publishedTime
        ? {
            publishedTime,
            modifiedTime: modifiedTime ?? publishedTime,
            authors: [site.name],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: ogImage, alt: imageAlt }],
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

function languageAlternatesFromPath(
  path: string,
  pathForLocale?: (locale: string) => string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = publicUrl(loc, pathForLocale?.(loc) ?? path);
  }
  languages["x-default"] = publicUrl(routing.defaultLocale, pathForLocale?.(routing.defaultLocale) ?? path);
  return languages;
}

/** Metadatos por defecto (español) para el layout raíz y fallbacks. */
export function buildRootSpanishMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = "Escuela de esquí en Sierra Nevada | Explora School & Club";
  const description = site.homeMetaDescriptionEs;
  const canonical = publicUrl("es", "/");

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
      canonical,
      languages: {
        es: canonical,
        en: publicUrl("en", "/"),
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      alternateLocale: ["en_GB"],
      url: canonical,
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
      images: [
        {
          url: DEFAULT_OG,
          alt: `${site.name} — clases de esquí y snowboard en Sierra Nevada`,
        },
      ],
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
