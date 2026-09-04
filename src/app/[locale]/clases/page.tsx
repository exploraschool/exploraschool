import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
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
      <PageHero
        locale={locale}
        title={pickLocale(locale, "Clases de esquí y snowboard", "Ski and snowboard lessons")}
        description={pickLocale(
          locale,
          "Instructores titulados con más de 20 años de experiencia. Grupos de 1 a 8, de 2 horas al día completo. Reserva online en minutos.",
          "Qualified instructors with over 20 years of experience. Groups of 1 to 8, from 2 hours to a full day. Book online in minutes.",
        )}
        imageSrc={media.clasesHero.src}
        imageAltEs={media.clasesHero.altEs}
        imageAltEn={media.clasesHero.altEn}
      />

      <section className="section-padding">
        <div className="container-page">
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
