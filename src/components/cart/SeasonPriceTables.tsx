"use client";

import { useState } from "react";
import { seasonPriceTables } from "@/data/prices";
import type { ProductId } from "@/data/products";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { DisclosureItem } from "@/components/DisclosureItem";
import {
  getBookingFromSeasonRow,
  readPeopleFromLocationSearch,
  type TimeSlotId,
} from "@/lib/booking-config";
import { FULL_DAY_HOURLY_EUR, PEOPLE_COUNT_HEADERS_EN, PEOPLE_COUNT_HEADERS_ES, UNIFIED_SIZE_LABEL_EN, UNIFIED_SIZE_LABEL_ES } from "@/lib/lesson-pricing";
import { pickLocale } from "@/lib/locale";
import { resolvePriceDisplay } from "@/lib/promotions";

type SeasonPriceTablesProps = {
  locale: string;
};

const PARTICIPANT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type BookingSelection = {
  productId: ProductId;
  timeSlotId: TimeSlotId;
  participants: number;
};

function initialParticipants(): number {
  return readPeopleFromLocationSearch() ?? 2;
}

export function SeasonPriceTables({ locale }: SeasonPriceTablesProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null);
  const peopleHeaders = locale === "es" ? PEOPLE_COUNT_HEADERS_ES : PEOPLE_COUNT_HEADERS_EN;

  function handlePriceClick(tableId: string, schedule: string) {
    const booking = getBookingFromSeasonRow(tableId, schedule);
    if (!booking) return;

    setBookingSelection({
      productId: booking.productId,
      timeSlotId: booking.timeSlotId,
      participants,
    });
  }

  return (
    <>
      <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-hielo/10 bg-white p-4 sm:p-5">
        <p className="text-sm font-medium text-pizarra">
          {pickLocale(locale, "¿Cuántas personas sois?", "How many people are you?")}
        </p>
        <div
          className="x-scroller mt-3 snap-x snap-mandatory sm:overflow-visible sm:snap-none"
          role="group"
          aria-label={pickLocale(locale, "Número de participantes", "Number of participants")}
        >
          <div className="flex w-max gap-2">
            {PARTICIPANT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setParticipants(n)}
                aria-pressed={participants === n}
                className={`flex h-11 w-11 shrink-0 snap-start items-center justify-center rounded-full text-sm font-semibold transition sm:h-10 sm:w-10 ${
                  participants === n
                    ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-md shadow-hielo/25"
                    : "border border-hielo/15 bg-nieve text-pizarra hover:border-hielo/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {peopleHeaders[participants - 1]}
          {participants <= 2
            ? pickLocale(
                locale,
                " · 1 y 2 personas pagan el mismo precio",
                " · 1 and 2 people pay the same price",
              )
            : null}
        </p>
      </div>

      <div className="space-y-3">
        {seasonPriceTables.map((table) => (
          <DisclosureItem
            key={table.id}
            variant="card"
            defaultOpen={table.id === "clases-2h"}
            bodyClassName="!p-0"
            title={
              <>
                <span className="font-display text-base font-semibold text-hielo sm:text-lg">
                  {pickLocale(locale, table.titleEs, table.titleEn)}
                </span>
                <span className="disclose__subtitle">
                  {pickLocale(locale, UNIFIED_SIZE_LABEL_ES, UNIFIED_SIZE_LABEL_EN)}
                </span>
              </>
            }
          >
            <div className="divide-y divide-hielo/8">
              {table.rows.map((row) => {
                const listPrice = row.prices[participants - 1];
                const display = resolvePriceDisplay(listPrice);
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
                          {pickLocale(
                            locale,
                            `5 h de clase · ${FULL_DAY_HOURLY_EUR} €/h`,
                            `5 h lesson · €${FULL_DAY_HOURLY_EUR}/h`,
                          )}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePriceClick(table.id, row.schedule)}
                      className="group/price shrink-0 rounded-xl px-2 py-1 text-right transition hover:bg-accent/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      aria-label={pickLocale(
                        locale,
                        `Reservar ${row.schedule} por ${display.finalPrice} €`,
                        `Book ${row.schedule} for €${display.finalPrice}`,
                      )}
                    >
                      {display.discountActive ? (
                        <>
                          <span className="block text-xs text-muted line-through">{display.listPrice} €</span>
                          <span className="text-lg font-bold text-accent transition group-hover/price:text-accent-dark">
                            {display.finalPrice} €
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-accent transition group-hover/price:text-accent-dark">
                          {display.finalPrice} €
                        </span>
                      )}
                      <span className="mt-0.5 block text-[0.65rem] text-muted">
                        {pickLocale(locale, "total grupo · reservar", "group total · book")}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </DisclosureItem>
        ))}
      </div>
      </div>

      {bookingSelection && (
        <AddToCartModal
          open
          onClose={() => setBookingSelection(null)}
          productId={bookingSelection.productId}
          defaultTimeSlotId={bookingSelection.timeSlotId}
          defaultParticipants={bookingSelection.participants}
        />
      )}
    </>
  );
}
