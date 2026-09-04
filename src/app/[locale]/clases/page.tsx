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
        title={pickLocale(
          locale,
          `Clases de esquí y snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
          `Ski and snowboard lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
        )}
        description={pickLocale(
          locale,
          `El mejor precio por hora es el día completo: ${FULL_DAY_HOURLY_EUR} €/h (5 h de clase). Compara horarios de 2 h y 3 h y reserva online. IVA incluido.`,
          `The best hourly rate is the full day: €${FULL_DAY_HOURLY_EUR}/h (5 h of teaching). Compare 2 h and 3 h slots and book online. VAT included.`,
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
