import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { PriceTables } from "@/components/PriceTables";
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
    path: "/clases",
    title: pickLocale(
      locale,
      "Precios de clases de esquí y snowboard en Sierra Nevada",
      "Ski and snowboard lesson prices in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      `Precios de clases particulares en Sierra Nevada: desde ${FULL_DAY_HOURLY_EUR} €/h en jornada completa. Esquí, snowboard y telemark. IVA incluido. Reserva online.`,
      `Private lesson prices in Sierra Nevada: from €${FULL_DAY_HOURLY_EUR}/h on a full day. Ski, snowboard and telemark. VAT included. Book online.`,
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
        description={pickLocale(
          locale,
          "Particulares de 1 a 8 personas. Esquí, snowboard o telemark, de 2 horas al día completo. Instructores titulados. IVA incluido.",
          "Private groups of 1 to 8. Ski, snowboard or telemark, from 2 hours to a full day. Qualified instructors. VAT included.",
        )}
      />

      <section className="pb-8 pt-3 sm:pb-10 sm:pt-5 md:pb-12 md:pt-7 lg:pb-16">
        <div className="container-page">
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
