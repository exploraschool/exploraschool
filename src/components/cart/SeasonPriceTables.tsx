import { pickLocale } from "@/lib/locale";
import { seasonPriceTables } from "@/data/prices";

type SeasonPriceTablesProps = {
  locale: string;
};

export function SeasonPriceTables({ locale }: SeasonPriceTablesProps) {
  return (
    <div className="mt-8 space-y-10">
      {seasonPriceTables.map((table) => (
        <div key={table.id} className="overflow-x-auto rounded-xl border border-hielo/10 bg-white">
          <div className="border-b border-hielo/10 px-4 py-3">
            <h3 className="font-display font-semibold text-hielo">
              {pickLocale(locale, table.titleEs, table.titleEn)} — {table.groupSizeLabel}
            </h3>
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
  );
}
