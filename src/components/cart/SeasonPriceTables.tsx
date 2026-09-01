"use client";

import { useState } from "react";
import { seasonPriceTables } from "@/data/prices";
import { PEOPLE_COUNT_HEADERS_EN, PEOPLE_COUNT_HEADERS_ES, UNIFIED_SIZE_LABEL_EN, UNIFIED_SIZE_LABEL_ES } from "@/lib/lesson-pricing";
import { pickLocale } from "@/lib/locale";

type SeasonPriceTablesProps = {
  locale: string;
};

const PARTICIPANT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function SeasonPriceTables({ locale }: SeasonPriceTablesProps) {
  const [participants, setParticipants] = useState(2);
  const peopleHeaders = locale === "es" ? PEOPLE_COUNT_HEADERS_ES : PEOPLE_COUNT_HEADERS_EN;

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-hielo/10 bg-white p-4 sm:p-5">
        <p className="text-sm font-medium text-pizarra">
          {pickLocale(locale, "¿Cuántas personas sois?", "How many people are you?")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={pickLocale(locale, "Número de participantes", "Number of participants")}>
          {PARTICIPANT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setParticipants(n)}
              aria-pressed={participants === n}
              className={`min-w-[2.75rem] rounded-full px-3 py-2 text-sm font-semibold transition ${
                participants === n
                  ? "bg-hielo text-white shadow-md shadow-hielo/25"
                  : "border border-hielo/15 bg-nieve text-pizarra hover:border-hielo/30"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          {peopleHeaders[participants - 1]}
        </p>
      </div>

      <div className="space-y-4">
        {seasonPriceTables.map((table) => (
          <details
            key={table.id}
            className="group overflow-hidden rounded-2xl border border-hielo/10 bg-white"
            open={table.id === "clases-2h"}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-transparent px-4 py-4 transition group-open:border-hielo/10 sm:px-5 [&::-webkit-details-marker]:hidden">
              <div>
                <h3 className="font-display text-base font-semibold text-hielo sm:text-lg">
                  {pickLocale(locale, table.titleEs, table.titleEn)}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {pickLocale(locale, UNIFIED_SIZE_LABEL_ES, UNIFIED_SIZE_LABEL_EN)}
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hielo/15 text-hielo transition group-open:rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>

            <div className="divide-y divide-hielo/8">
              {table.rows.map((row) => {
                const price = row.prices[participants - 1];
                const isRecommended = table.id === "clases-2h" && row.schedule === "10:00–12:00";
                const isFullDay = table.id === "full-day";

                return (
                  <div
                    key={row.schedule}
                    className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 ${
                      isRecommended ? "bg-accent/5" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-pizarra">{row.schedule}</p>
                      {isRecommended && (
                        <span className="mt-0.5 inline-block text-[0.65rem] font-bold uppercase tracking-wider text-accent">
                          {pickLocale(locale, "Horario más solicitado", "Most requested slot")}
                        </span>
                      )}
                      {isFullDay && (
                        <span className="mt-0.5 block text-xs text-muted">
                          {pickLocale(locale, "5 h de clase + 1 h de comodín", "5 h lesson + 1 h buffer")}
                        </span>
                      )}
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="text-lg font-bold text-accent">{price} €</span>
                      <span className="mt-0.5 block text-[0.65rem] text-muted">
                        {pickLocale(locale, "total grupo", "group total")}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
