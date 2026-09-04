import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { PriceTables } from "@/components/PriceTables";
import { CTASection } from "@/components/CTASection";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/clases",
    title: pickLocale(
      locale,
      "Clases de esquí, snowboard y telemark en Sierra Nevada",
      "Ski, snowboard and telemark lessons in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Tarifas e información de clases particulares y en grupo en Sierra Nevada. Precios con IVA incluido. Reserva online con Explora School & Club.",
      "Browse our ski, snowboard and telemark lessons in Sierra Nevada. Prices include VAT.",
    ),
  });
}

export default async function ClasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        locale={locale}
        title={pickLocale(
          locale,
          "Clases de esquí, snowboard y telemark",
          "Ski, snowboard and telemark lessons",
        )}
        description={pickLocale(
          locale,
          "Tarifas e información de clases particulares y en grupo. Precios con IVA incluido. Reserva online.",
          "Prices and info for private and group lessons. VAT included. Book online.",
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
