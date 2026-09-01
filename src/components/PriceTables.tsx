import { pickLocale } from "@/lib/locale";
import {
  currentPrices,
  legacyPriceTables,
  legacyFromPrices,
  priceNotes,
} from "@/data/prices";
import { products } from "@/data/products";
import { site } from "@/data/site";

type PriceTablesProps = {
  locale: string;
};

export function PriceTables({ locale }: PriceTablesProps) {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, "Temporada 2025/26", "Season 2025/26")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {currentPrices.map((price) => (
            <article key={price.id} className="card">
              <h3 className="font-display text-xl font-semibold">{pickLocale(locale, price.titleEs, price.titleEn)}</h3>
              {price.fromPrice && (
                <p className="mt-2 text-2xl font-semibold text-accent">
                  {pickLocale(locale, "desde", "from")} {price.fromPrice} €
                  <span className="text-sm font-normal text-muted">
                    {price.unit === "person"
                      ? pickLocale(locale, " / persona", " / person")
                      : pickLocale(locale, " / día", " / day")}
                  </span>
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {pickLocale(locale, price.featuresEs, price.featuresEn).map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              {price.extras?.map((extra) => (
                <p key={extra.labelEs} className="mt-3 text-sm font-medium text-hielo">
                  {pickLocale(locale, extra.labelEs, extra.labelEn)}: {extra.value}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, "Todos los productos", "All products")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((p) => p.season !== "legacy-2022" || p.highlighted)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((product) => (
              <article key={product.id} className="rounded-lg border border-hielo/10 bg-white p-5">
                <h3 className="font-semibold text-pizarra">
                  {pickLocale(locale, product.titleEs, product.titleEn)}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
                </p>
                {product.fromPrice && (
                  <p className="mt-3 text-sm font-semibold text-accent">
                    {pickLocale(locale, "desde", "from")} {product.fromPrice} €
                  </p>
                )}
              </article>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-hielo">
          {pickLocale(locale, "Tarifas de referencia (2022)", "Reference prices (2022)")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {pickLocale(locale, priceNotes.vatEs, priceNotes.vatEn)}{" "}
          {pickLocale(locale, priceNotes.extraPersonCurrentEs, priceNotes.extraPersonCurrentEn)}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {legacyFromPrices.map((item) => (
            <div key={item.productId} className="rounded-lg border border-hielo/10 bg-nieve p-4">
              <p className="font-semibold">{pickLocale(locale, item.labelEs, item.labelEn)}</p>
              <p className="mt-1 text-sm text-muted">
                {pickLocale(locale, item.descriptionEs, item.descriptionEn)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {legacyPriceTables.map((table) => (
            <div key={table.id} className="overflow-x-auto rounded-xl border border-hielo/10 bg-white">
              <div className="border-b border-hielo/10 px-4 py-3">
                <h3 className="font-display font-semibold text-hielo">
                  {pickLocale(locale, table.titleEs, table.titleEn)} — {table.groupSizeLabel}
                </h3>
                {table.noteEs && (
                  <p className="text-xs text-accent">{pickLocale(locale, table.noteEs, table.noteEn!)}</p>
                )}
              </div>
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="bg-nieve text-left">
                    {table.headers.map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-pizarra">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.schedule} className="border-t border-hielo/10">
                      <td className="px-4 py-3 font-medium">{row.schedule}</td>
                      {row.prices.map((p, i) => (
                        <td key={i} className="px-4 py-3 text-muted">
                          {p} €
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            {pickLocale(locale, "Confirmar precio 2025/26 por WhatsApp", "Confirm 2025/26 price on WhatsApp")}
          </a>
        </div>
      </section>
    </div>
  );
}
