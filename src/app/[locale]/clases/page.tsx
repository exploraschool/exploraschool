import { setRequestLocale } from "next-intl/server";
import { PriceTables } from "@/components/PriceTables";
import { CTASection } from "@/components/CTASection";
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
      <section className="section-padding">
        <div className="container-page stack-lg">
          <header className="max-w-3xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-hielo sm:text-4xl">
              {pickLocale(
                locale,
                "Clases de esquí, snowboard y telemark en Sierra Nevada",
                "Ski, snowboard and telemark lessons in Sierra Nevada",
              )}
            </h1>
            <p className="mt-3 text-base text-muted sm:text-lg">
              {pickLocale(
                locale,
                "Tarifas e información de clases particulares y en grupo. Precios con IVA incluido. Reserva online.",
                "Prices and info for private and group lessons. VAT included. Book online.",
              )}
            </p>
          </header>
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
