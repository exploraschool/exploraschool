import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { PriceTables } from "@/components/PriceTables";
import { CTASection } from "@/components/CTASection";
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
      "Clases particulares en Sierra Nevada",
      "Private lessons in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Clases particulares de esquí, snowboard y telemark en Sierra Nevada. De 1 a 8 personas, de 2 horas al Full Day. Instructores titulados. Reserva online.",
      "Private ski, snowboard and telemark lessons in Sierra Nevada. Groups of 1 to 8, from 2 hours to a Full Day. Qualified instructors. Book online.",
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
          "Particulares de 1 a 8 personas. Esquí, snowboard o telemark, de 2 horas al Full Day. Instructores titulados. IVA incluido.",
          "Private groups of 1 to 8. Ski, snowboard or telemark, from 2 hours to a Full Day. Qualified instructors. VAT included.",
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
