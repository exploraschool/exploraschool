import { getSiteUrl } from "@/lib/site-url";
import { publicUrl } from "@/lib/seo-urls";
import { pickLocale } from "@/lib/locale";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbJsonLdProps = {
  locale: string;
  items: BreadcrumbItem[];
};

export function homeCrumb(locale: string): BreadcrumbItem {
  return { name: pickLocale(locale, "Inicio", "Home"), path: "/" };
}

export function BreadcrumbJsonLd({ locale, items }: BreadcrumbJsonLdProps) {
  const trail = items[0]?.path === "/" ? items : [homeCrumb(locale), ...items];

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: publicUrl(locale, item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
