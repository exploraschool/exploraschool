import { site } from "@/data/site";

type JsonLdProps = {
  type?: "LocalBusiness" | "FAQPage";
  faqItems?: { question: string; answer: string }[];
};

export function JsonLd({ type = "LocalBusiness", faqItems }: JsonLdProps) {
  let data: Record<string, unknown>;

  if (type === "FAQPage" && faqItems) {
    data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
  } else {
    data = {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      name: site.nap.name,
      description: site.taglineEs,
      url: site.domain,
      telephone: site.phone,
      email: site.email,
      foundingDate: String(site.foundedYear),
      address: {
        "@type": "PostalAddress",
        streetAddress: site.nap.streetAddress,
        addressLocality: site.nap.addressLocality,
        addressRegion: site.nap.addressRegion,
        postalCode: site.nap.postalCode,
        addressCountry: site.nap.addressCountry,
      },
      openingHours: site.openingHours,
      sameAs: site.social.map((s) => s.url),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: site.tripAdvisor.rating,
        reviewCount: site.tripAdvisor.reviewCount,
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
