import { site } from "@/data/site";
import { media } from "@/lib/media";

export function JsonLd() {
  const graph = [
    {
      "@type": "Organization",
      "@id": `${site.domain}/#organization`,
      name: site.name,
      url: site.domain,
      logo: `${site.domain}${media.logo}`,
      foundingDate: String(site.foundedYear),
      email: site.email,
      telephone: site.phone,
      sameAs: site.social.map((s) => s.url),
    },
    {
      "@type": "WebSite",
      "@id": `${site.domain}/#website`,
      url: site.domain,
      name: site.name,
      publisher: { "@id": `${site.domain}/#organization` },
      inLanguage: ["es", "en"],
    },
    {
      "@type": "SportsActivityLocation",
      "@id": `${site.domain}/#business`,
      name: site.nap.name,
      description: site.taglineEs,
      url: site.domain,
      telephone: site.phone,
      email: site.email,
      image: `${site.domain}${media.og}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.nap.streetAddress,
        addressLocality: site.nap.addressLocality,
        addressRegion: site.nap.addressRegion,
        postalCode: site.nap.postalCode,
        addressCountry: site.nap.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.meetingPoint.latitude,
        longitude: site.meetingPoint.longitude,
      },
      hasMap: site.meetingPoint.googleMapsUrl,
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "20:00",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: site.tripAdvisor.rating,
        reviewCount: site.tripAdvisor.reviewCount,
        bestRating: 5,
      },
      priceRange: "€€",
      sameAs: site.social.map((s) => s.url),
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
