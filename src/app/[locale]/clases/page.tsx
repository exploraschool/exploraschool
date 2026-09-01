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
    title: pickLocale(locale, "Clases y tarifas", "Lessons & prices"),
    description: pickLocale(
      locale,
      "Consulta nuestras clases de esquí, snowboard y telemark en Sierra Nevada. Precios con IVA incluido.",
      "Browse our ski, snowboard and telemark lessons in Sierra Nevada. Prices include VAT.",
    ),
  });
}

export default async function ClasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page">
          <p className="eyebrow">{pickLocale(locale, "Servicios", "Services")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {pickLocale(locale, "Clases y tarifas", "Lessons & prices")}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            {pickLocale(
              locale,
              "Consulta nuestros servicios y escoge el que más se adapte a tus necesidades. Escoge la tarifa que mejor se adapte a tu horario.",
              "Browse our services and choose the format that suits you best. Pick the schedule that works for you.",
            )}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
