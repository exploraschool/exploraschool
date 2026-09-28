import { getMainDisciplines } from "@/data/disciplines";
import { getProductBySlug } from "@/data/products";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { media } from "@/lib/media";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { getProductOfferRange } from "@/lib/product-offer";
import { tripAdvisorSummary } from "@/data/reviews";
import {
  disciplinePath,
  homeUrl,
  productPath,
  publicUrl,
  type IndexableProductId,
} from "@/lib/seo-urls";

type JsonLdProps = {
  locale: string;
};

export function JsonLd({ locale }: JsonLdProps) {
  const isSpanish = locale !== "en";
  const localeHome = homeUrl(locale);
  const sameAs = [...site.social.map((s) => s.url), site.tripAdvisor.url];
  const tagline = pickLocale(locale, site.taglineEs, site.taglineEn);
  const homeDescription = pickLocale(
    locale,
    site.homeMetaDescriptionEs,
    site.homeMetaDescriptionEn,
  );
  const inLanguage = isSpanish ? "es-ES" : "en-GB";
  const lessonOffers = (["full-day", "curso-snow", "particular"] as const satisfies readonly IndexableProductId[]).flatMap(
    (productId) => {
      const product = getProductBySlug(productId);
      const path = productPath(productId);
      const range = getProductOfferRange(productId);
      if (!product || !path || !range) return [];
      const url = publicUrl(locale, path);
      const name = pickLocale(locale, product.titleEs, product.titleEn);
      return [
        {
          "@type": "Offer",
          name,
          url,
          price: range.lowPrice,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          description: pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn),
          itemOffered: {
            "@type": "Service",
            name,
            description: pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn),
            url,
            areaServed: "Sierra Nevada, Granada",
          },
        },
      ];
    },
  );

  const graph = [
    {
      "@type": "Organization",
      "@id": `${site.domain}/#organization`,
      name: site.name,
      alternateName: ["Explora School", "Explora Sierra Nevada"],
      url: site.domain,
      logo: `${site.domain}${media.logo}`,
      foundingDate: String(site.foundedYear),
      email: site.email,
      telephone: site.phone,
      sameAs,
      description: tagline,
      areaServed: {
        "@type": "Place",
        name: "Sierra Nevada, Granada, España",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.domain}/#website`,
      url: localeHome,
      name: site.name,
      description: homeDescription,
      publisher: { "@id": `${site.domain}/#organization` },
      inLanguage: ["es-ES", "en-GB"],
    },
    {
      "@type": ["SportsActivityLocation", "LocalBusiness"],
      "@id": `${site.domain}/#business`,
      name: site.nap.name,
      description: tagline,
      url: localeHome,
      telephone: site.phone,
      email: site.email,
      image: `${site.domain}${media.og}`,
      inLanguage,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.nap.streetAddress,
        addressLocality: site.nap.addressLocality,
        addressRegion: site.nap.addressRegion,
        postalCode: site.nap.postalCode,
        addressCountry: "ES",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.meetingPoint.latitude,
        longitude: site.meetingPoint.longitude,
      },
      hasMap: site.meetingPoint.googleMapsUrl,
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
      priceRange: `€${FULL_DAY_HOURLY_EUR}/h`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tripAdvisorSummary.rating,
        reviewCount: tripAdvisorSummary.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      sameAs,
      knowsLanguage: ["es", "en"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: pickLocale(locale, "Clases de nieve", "Snow lessons"),
        itemListElement: [
          ...lessonOffers,
          ...getMainDisciplines().map((d) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: pickLocale(locale, d.nameEs, d.nameEn),
              description: pickLocale(locale, d.descriptionEs, d.descriptionEn),
              url: publicUrl(locale, disciplinePath(d.id)),
            },
          })),
        ],
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
