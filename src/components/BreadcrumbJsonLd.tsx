import { pickLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site-url";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbJsonLdProps = {
  locale: string;
  items: BreadcrumbItem[];
};

function absoluteUrl(siteUrl: string, locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const suffix = normalized === "/" ? "" : normalized;
  return `${siteUrl}/${locale}${suffix}`;
}

export function homeCrumb(locale: string): BreadcrumbItem {
  return { name: pickLocale(locale, "Inicio", "Home"), path: "/" };
}

export function BreadcrumbJsonLd({ locale, items }: BreadcrumbJsonLdProps) {
  const siteUrl = getSiteUrl();
  const trail = items[0]?.path === "/" ? items : [homeCrumb(locale), ...items];

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, locale, item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
