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
      <section className="section-padding">
        <div className="container-page stack-lg">
          <h1 className="sr-only">
            {pickLocale(locale, "Clases y tarifas", "Lessons & prices")}
          </h1>
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
