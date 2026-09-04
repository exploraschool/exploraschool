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
      `Clases de esquí y snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
      `Ski and snowboard lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
    ),
    description: pickLocale(
      locale,
      `Precios de clases particulares en Sierra Nevada: desde ${FULL_DAY_HOURLY_EUR} €/h en jornada completa. Esquí, snowboard y telemark. IVA incluido. Reserva online.`,
      `Private lesson prices in Sierra Nevada: from €${FULL_DAY_HOURLY_EUR}/h on a full day. Ski, snowboard and telemark. VAT included. Book online.`,
    ),
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
        eyebrow="Sierra Nevada · Granada"
        title={pickLocale(locale, "Clases de esquí y snowboard", "Ski and snowboard lessons")}
        description={pickLocale(
          locale,
          "Instructores titulados. Grupos de 1 a 8. Elige 2 h, 3 h o día completo y reserva online.",
          "Qualified instructors. Groups of 1 to 8. Choose 2 h, 3 h or a full day and book online.",
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
