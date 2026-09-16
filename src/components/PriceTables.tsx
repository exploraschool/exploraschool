import { Link } from "@/i18n/routing";
import { LessonProductCatalog } from "@/components/cart/LessonProductCatalog";
import { SeasonPriceTables } from "@/components/cart/SeasonPriceTables";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";
import { priceNotes } from "@/data/prices";

type PriceTablesProps = {
  locale: string;
};

export function PriceTables({ locale }: PriceTablesProps) {
  return (
    <>
      <section id="formatos" className="scroll-target">
        <EarlyBirdBanner locale={locale} />
        <div className="mt-3 sm:mt-4">
          <LessonProductCatalog locale={locale} />
        </div>
      </section>

      <section id="horarios" className="scroll-target border-t border-hielo/10 pt-10 sm:pt-12 md:pt-14">
        <SectionHeader
          eyebrow={pickLocale(locale, "Consulta detallada", "Detailed lookup")}
          title={pickLocale(locale, "Tarifas por horario", "Prices by time slot")}
          description={pickLocale(
            locale,
            "Elige cuántas personas sois y verás el precio de cada horario. Pulsa un importe para reservar.",
            "Choose your group size to see the price for each time slot. Tap an amount to book.",
          )}
        />
        <p className="mt-4 text-sm font-medium text-hielo sm:mt-5">
          {pickLocale(locale, priceNotes.groupTotalEs, priceNotes.groupTotalEn)}
        </p>
        <div className="section-body-sm">
          <SeasonPriceTables locale={locale} />
        </div>
        <p className="mt-6 text-sm text-muted">
          {pickLocale(locale, "El cuadro oficial completo está en ", "The full official chart is on ")}
          <Link href="/tarifas" className="font-semibold text-hielo hover:text-accent">
            {pickLocale(locale, "Tarifas", "Rates")}
          </Link>
          .
        </p>
      </section>
    </>
  );
}
