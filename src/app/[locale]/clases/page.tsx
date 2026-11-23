import { setRequestLocale } from "next-intl/server";
import { CLASES_HUB_AEO } from "@/data/landing-aeo";
import { PageHeader } from "@/components/PageHeader";
import { PriceTables } from "@/components/PriceTables";
import { CTASection } from "@/components/CTASection";
import { LandingFaqSection } from "@/components/LandingFaqSection";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/clases",
    title: pickLocale(
      locale,
      "Clases de esquí y snowboard Sierra Nevada",
      "Ski and snowboard lessons Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Clases de esquí, snowboard y telemark en Sierra Nevada: particulares, Full Day y curso de snowboard. De 1 a 8 personas. Instructores titulados. Reserva online.",
      "Ski, snowboard and telemark lessons in Sierra Nevada: private, Full Day and snowboard course. Groups of 1 to 8. Qualified instructors. Book online.",
    ),
    ogImage: media.clasesHero.src,
    ogImageAlt: pickLocale(locale, media.clasesHero.altEs, media.clasesHero.altEn),
  });
}

export default async function ClasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[{ name: pickLocale(locale, "Clases", "Lessons"), path: "/clases" }]}
      />
      <PageHeader
        className="!pb-4 sm:!pb-6 md:!pb-8"
        title={pickLocale(locale, "Elige tu clase", "Choose your lesson")}
        description={pickLocale(locale, CLASES_HUB_AEO.leadEs, CLASES_HUB_AEO.leadEn)}
      />

      <section className="pb-8 pt-3 sm:pb-10 sm:pt-5 md:pb-12 md:pt-7 lg:pb-16">
        <div className="container-page">
          <PriceTables locale={locale} />
        </div>
      </section>

      <LandingFaqSection
        locale={locale}
        faqs={CLASES_HUB_AEO.faqs}
        links={CLASES_HUB_AEO.links}
        className="section-padding bg-nieve"
      />

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
