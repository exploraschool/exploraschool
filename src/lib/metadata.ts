import type { Metadata } from "next";
import { site } from "@/data/site";

const DEFAULT_OG = "/images/logo-512.png";

type PageMeta = {
  locale: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  ogImage = DEFAULT_OG,
  noIndex = false,
}: PageMeta): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${site.domain}/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
  const fullTitle = title.includes("Explora") ? title : `${title} | Explora School & Club`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(site.domain),
    alternates: {
      canonical,
      languages: {
        es: `${site.domain}/es${normalizedPath === "/" ? "" : normalizedPath}`,
        en: `${site.domain}/en${normalizedPath === "/" ? "" : normalizedPath}`,
        "x-default": `${site.domain}/es${normalizedPath === "/" ? "" : normalizedPath}`,
      },
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
