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
        <div className="section-body-sm">
          <LessonProductCatalog locale={locale} />
        </div>
      </section>

      <section id="tarifas" className="scroll-target border-t border-hielo/10 pt-10 sm:pt-12 md:pt-14">
        <SectionHeader
          eyebrow={pickLocale(locale, "Consulta detallada", "Detailed lookup")}
          title={pickLocale(locale, "Tarifas por horario", "Prices by time slot")}
          description={pickLocale(
            locale,
            "¿Necesitas comparar horarios o ver el precio según el tamaño del grupo? Usa esta tabla antes de reservar clases particulares.",
            "Need to compare time slots or see the price for your group size? Use this table before booking private lessons.",
          )}
        />
        <p className="mt-4 text-sm font-medium text-hielo sm:mt-5">
          {pickLocale(locale, priceNotes.groupTotalEs, priceNotes.groupTotalEn)}
        </p>
        <div className="section-body-sm">
          <SeasonPriceTables locale={locale} />
        </div>
      </section>
    </>
  );
}
