import { setRequestLocale } from "next-intl/server";
import { TARIFAS_HUB_AEO } from "@/data/landing-aeo";
import { PageHeader } from "@/components/PageHeader";
import { CompleteRateTables } from "@/components/CompleteRateTables";
import { CTASection } from "@/components/CTASection";
import { LandingFaqSection } from "@/components/LandingFaqSection";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/tarifas",
    title: pickLocale(
      locale,
      "Tarifas de clases en Sierra Nevada",
      "Lesson rates in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      `Cuadro de tarifas de clases en Sierra Nevada: desde ${FULL_DAY_HOURLY_EUR} €/h en Full Day. Particulares, Full Day y curso snowboard. IVA incluido.`,
      `Lesson rate chart in Sierra Nevada: from €${FULL_DAY_HOURLY_EUR}/h on a Full Day. Private, Full Day and snowboard course. VAT included.`,
    ),
    ogImage: media.clasesHero.src,
    ogImageAlt: pickLocale(locale, media.clasesHero.altEs, media.clasesHero.altEn),
  });
}

export default async function TarifasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[{ name: pickLocale(locale, "Tarifas", "Rates"), path: "/tarifas" }]}
      />
      <PageHeader
        className="!pb-4 sm:!pb-6 md:!pb-8"
        title={pickLocale(locale, "Tarifas de clases en Sierra Nevada", "Lesson rates in Sierra Nevada")}
        description={pickLocale(locale, TARIFAS_HUB_AEO.leadEs, TARIFAS_HUB_AEO.leadEn)}
      />

      <section className="section-padding pt-3 sm:pt-5 md:pt-7">
        <div className="container-page">
          <h2 className="section-title mb-6 sm:mb-8">
            {pickLocale(
              locale,
              "Cuadro oficial de tarifas",
              "Official rate chart",
            )}
          </h2>
          <CompleteRateTables locale={locale} />
        </div>
      </section>

      <LandingFaqSection
        locale={locale}
        faqs={TARIFAS_HUB_AEO.faqs}
        links={TARIFAS_HUB_AEO.links}
        className="section-padding bg-nieve"
      />

      <CTASection locale={locale} />
    </>
  );
}
