import { LessonProductCatalog } from "@/components/cart/LessonProductCatalog";
import { SeasonPriceTables } from "@/components/cart/SeasonPriceTables";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { priceNotes } from "@/data/prices";
import { CURRENT_SEASON } from "@/data/season";

type PriceTablesProps = {
  locale: string;
};

export function PriceTables({ locale }: PriceTablesProps) {
  return (
    <>
      <section id="formatos" className="scroll-target">
        <SectionHeader
          eyebrow={pickLocale(locale, `Temporada ${CURRENT_SEASON.label}`, `Season ${CURRENT_SEASON.label}`)}
          title={pickLocale(locale, "Elige tu formato", "Choose your format")}
          description={pickLocale(
            locale,
            `El día completo es el mejor precio por hora (${FULL_DAY_HOURLY_EUR} €/h). Elige 2 h, 3 h o jornada completa y añádelo a la reserva.`,
            `The full day is the best hourly rate (€${FULL_DAY_HOURLY_EUR}/h). Pick 2 h, 3 h or a full day and add it to your booking.`,
          )}
        />
        <p className="mt-4 text-sm font-medium text-hielo sm:mt-5">
          {pickLocale(locale, priceNotes.vatEs, priceNotes.vatEn)}
        </p>
        <EarlyBirdBanner locale={locale} className="mt-6 sm:mt-8" />
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
