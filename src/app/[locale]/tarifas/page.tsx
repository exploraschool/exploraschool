import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { CompleteRateTables } from "@/components/CompleteRateTables";
import { CTASection } from "@/components/CTASection";
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
      `Cuadro de tarifas de clases particulares en Sierra Nevada: desde ${FULL_DAY_HOURLY_EUR} €/h en Full Day. Esquí, snowboard y telemark. IVA incluido.`,
      `Private lesson rate chart in Sierra Nevada: from €${FULL_DAY_HOURLY_EUR}/h on a Full Day. Ski, snowboard and telemark. VAT included.`,
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
        description={pickLocale(
          locale,
          "Precios oficiales de particulares, Full Day y curso de snowboard. Esquí, snowboard y telemark. IVA incluido.",
          "Official prices for private lessons, Full Day and the snowboard course. Ski, snowboard and telemark. VAT included.",
        )}
      />

      <section className="section-padding pt-3 sm:pt-5 md:pt-7">
        <div className="container-page">
          <CompleteRateTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
