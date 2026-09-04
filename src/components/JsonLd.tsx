import { getMainDisciplines } from "@/data/disciplines";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { media } from "@/lib/media";
import { FULL_DAY_EFFECTIVE_HOURS, FULL_DAY_HOURLY_EUR, SESSION_FULL_DAY } from "@/lib/lesson-pricing";
import { tripAdvisorSummary } from "@/data/reviews";

type JsonLdProps = {
  locale: string;
};

export function JsonLd({ locale }: JsonLdProps) {
  const isSpanish = locale !== "en";
  const localeUrl = `${site.domain}/${locale}`;
  const sameAs = [...site.social.map((s) => s.url), site.tripAdvisor.url];
  const tagline = pickLocale(locale, site.taglineEs, site.taglineEn);
  const homeDescription = pickLocale(
    locale,
    site.homeMetaDescriptionEs,
    site.homeMetaDescriptionEn,
  );
  const inLanguage = isSpanish ? "es-ES" : "en-GB";

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
      url: localeUrl,
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
      url: localeUrl,
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
          {
            "@type": "Offer",
            name: pickLocale(locale, "Día completo", "Full Day"),
            url: `${localeUrl}/clases`,
            price: FULL_DAY_HOURLY_EUR,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            description: pickLocale(
              locale,
              `Precio por hora en jornada completa (${FULL_DAY_EFFECTIVE_HOURS} h de clase). Total desde ${SESSION_FULL_DAY[0]} € para 1 o 2 personas.`,
              `Hourly rate on a full day (${FULL_DAY_EFFECTIVE_HOURS} h of teaching). Total from €${SESSION_FULL_DAY[0]} for 1 or 2 people.`,
            ),
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: FULL_DAY_HOURLY_EUR,
              priceCurrency: "EUR",
              unitText: pickLocale(locale, "hora", "hour"),
              referenceQuantity: {
                "@type": "QuantitativeValue",
                value: 1,
                unitCode: "HUR",
              },
            },
            itemOffered: {
              "@type": "Service",
              name: pickLocale(
                locale,
                "Clases de esquí y snowboard — jornada completa",
                "Ski and snowboard lessons — full day",
              ),
              areaServed: "Sierra Nevada, Granada",
            },
          },
          ...getMainDisciplines().map((d) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: pickLocale(locale, d.nameEs, d.nameEn),
              description: pickLocale(locale, d.descriptionEs, d.descriptionEn),
              url: `${localeUrl}/clases/${d.slug}`,
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
