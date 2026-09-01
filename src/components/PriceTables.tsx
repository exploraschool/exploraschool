import { Link } from "@/i18n/routing";
import { CurrentPriceCards } from "@/components/cart/CurrentPriceCards";
import { PriceProductCards } from "@/components/cart/PriceProductCards";
import { SeasonPriceTables } from "@/components/cart/SeasonPriceTables";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { pickLocale } from "@/lib/locale";
import { priceNotes } from "@/data/prices";
import { CURRENT_SEASON } from "@/data/season";

type PriceTablesProps = {
  locale: string;
};

export function PriceTables({ locale }: PriceTablesProps) {
  return (
    <div className="space-y-16">
      <EarlyBirdBanner locale={locale} />

      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, `Temporada ${CURRENT_SEASON.label}`, `Season ${CURRENT_SEASON.label}`)}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {pickLocale(locale, priceNotes.vatEs, priceNotes.vatEn)}{" "}
          {pickLocale(locale, priceNotes.extraPersonCurrentEs, priceNotes.extraPersonCurrentEn)}
        </p>
        <CurrentPriceCards locale={locale} />
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, "Tarifas por horario y grupo", "Rates by schedule and group size")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {pickLocale(
            locale,
            "Precios por sesión según horario y número de personas. El total en la reserva se calcula automáticamente.",
            "Price per session by schedule and group size. Your booking total is calculated automatically.",
          )}
        </p>
        <SeasonPriceTables locale={locale} />
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, "Todos los productos", "All products")}
        </h2>
        <PriceProductCards locale={locale} />
      </section>

      <div className="text-center">
        <Link href="/reserva" className="btn-primary inline-flex !w-auto">
          {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
        </Link>
      </div>
    </div>
  );
}
