"use client";

import { useState } from "react";
import { completeRateTables, priceNotes } from "@/data/prices";
import type { ProductId } from "@/data/products";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { getBookingFromSeasonRow, getParticipantLimits, type TimeSlotId } from "@/lib/booking-config";
import { PEOPLE_COUNT_HEADERS_EN, PEOPLE_COUNT_HEADERS_ES } from "@/lib/lesson-pricing";
import { pickLocale } from "@/lib/locale";

type CompleteRateTablesProps = {
  locale: string;
};

type BookingSelection = {
  productId: ProductId;
  timeSlotId: TimeSlotId;
  participants: number;
};

export function CompleteRateTables({ locale }: CompleteRateTablesProps) {
  const peopleHeaders = locale === "es" ? PEOPLE_COUNT_HEADERS_ES : PEOPLE_COUNT_HEADERS_EN;
  const scheduleLabel = pickLocale(locale, "Horario", "Schedule");
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null);

  return (
    <>
      <p className="text-sm font-medium text-hielo">
        {pickLocale(locale, priceNotes.groupTotalEs, priceNotes.groupTotalEn)}{" "}
        {pickLocale(locale, priceNotes.vatEs, priceNotes.vatEn)}
      </p>
      <p className="mt-1.5 text-xs text-muted sm:text-sm">
        {pickLocale(
          locale,
          "Pulsa un precio para reservar exactamente esa tarifa: producto, horario y número de personas. Después eliges el día y, si el producto lo permite, la disciplina.",
          "Tap a price to book exactly that rate: product, time slot and group size. Then you choose the day and, if the product allows it, the discipline.",
        )}
      </p>

      <div className="section-body-sm">
        <div className="overflow-hidden rounded-2xl border border-hielo/12 bg-white shadow-[0_2px_16px_rgba(14,14,15,0.04)]">
          <table className="w-full table-fixed border-collapse text-[0.625rem] leading-tight sm:text-sm sm:leading-normal">
            <caption className="sr-only">
              {pickLocale(
                locale,
                "Cuadro de tarifas oficiales por horario y número de personas, sin promociones. Cada precio abre la reserva.",
                "Official rate chart by time slot and group size, promotions not included. Each price opens the booking.",
              )}
            </caption>
            <colgroup>
              <col className="w-[22%] sm:w-[18%]" />
              {peopleHeaders.map((label) => (
                <col key={label} className="w-[9.75%] sm:w-[10.25%]" />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-hielo text-nieve">
                <th
                  scope="col"
                  rowSpan={2}
                  className="border-b border-white/10 px-1 py-2 text-left text-[0.6rem] font-bold uppercase tracking-wide sm:px-4 sm:py-3 sm:text-[0.7rem] sm:tracking-wider"
                >
                  {scheduleLabel}
                </th>
                <th
                  scope="colgroup"
                  colSpan={8}
                  className="border-b border-white/10 px-1 py-1.5 text-center text-[0.6rem] font-bold uppercase tracking-wide sm:px-2 sm:py-2 sm:text-[0.7rem] sm:tracking-wider"
                >
                  {pickLocale(locale, "Personas · €", "People · €")}
                </th>
              </tr>
              <tr className="border-b border-hielo/10 bg-hielo text-nieve">
                {peopleHeaders.map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className="px-0 py-1.5 text-center text-[0.6rem] font-bold uppercase tracking-wide sm:px-3 sm:py-2 sm:text-[0.7rem] sm:tracking-wider"
                  >
                    <span aria-hidden>{index + 1}</span>
                    <span className="sr-only">{label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completeRateTables.flatMap((table) => {
                const sectionTitle = pickLocale(locale, table.titleEs, table.titleEn);
                const section = [
                  <tr key={`${table.id}-section`} className="border-t border-hielo/10 bg-nieve">
                    <td colSpan={9} className="px-1.5 py-2 sm:px-4 sm:py-2.5">
                      <span className="font-display text-[0.7rem] font-semibold text-hielo sm:text-base">
                        {sectionTitle}
                      </span>
                      <span className="ml-1 text-[0.6rem] font-medium text-muted sm:ml-2 sm:text-xs">
                        {pickLocale(locale, table.subtitleEs, table.subtitleEn)}
                      </span>
                    </td>
                  </tr>,
                ];

                const dataRows = table.rows.map((row, rowIndex) => {
                  const schedule = pickLocale(locale, row.scheduleEs, row.scheduleEn);
                  const zebra = rowIndex % 2 === 0 ? "bg-white" : "bg-nieve";
                  const booking = getBookingFromSeasonRow(table.id, row.scheduleEs);
                  const limits = booking
                    ? getParticipantLimits(
                        booking.productId,
                        table.id === "curso-snow" ? "snowboard" : undefined,
                        booking.timeSlotId,
                      )
                    : null;

                  return (
                    <tr key={`${table.id}-${row.scheduleEs}`} className={`border-t border-hielo/8 ${zebra}`}>
                      <th
                        scope="row"
                        className={`px-1 py-1.5 text-left font-medium text-pizarra sm:px-4 sm:py-2.5 ${zebra}`}
                      >
                        {schedule}
                      </th>
                      {row.prices.map((price, index) => {
                        const people = index + 1;
                        const selection =
                          booking &&
                          limits &&
                          price != null &&
                          people >= limits.minPeople &&
                          people <= limits.maxPeople
                            ? {
                                productId: booking.productId,
                                timeSlotId: booking.timeSlotId,
                                participants: people,
                              }
                            : null;

                        return (
                          <td
                            key={`${table.id}-${row.scheduleEs}-${people}`}
                            className="px-0 py-0 text-center tabular-nums text-pizarra sm:px-1"
                          >
                            {price == null ? (
                              <span className="block px-0 py-1.5 text-muted sm:py-2.5">—</span>
                            ) : selection ? (
                              <button
                                type="button"
                                onClick={() => setBookingSelection(selection)}
                                className="relative z-10 block w-full rounded-md px-0 py-1.5 font-semibold text-hielo transition hover:bg-accent/10 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:py-2.5"
                                aria-label={pickLocale(
                                  locale,
                                  `Reservar ${sectionTitle}, ${schedule}, ${people} ${people === 1 ? "persona" : "personas"}, ${price} €`,
                                  `Book ${sectionTitle}, ${schedule}, ${people} ${people === 1 ? "person" : "people"}, €${price}`,
                                )}
                              >
                                {price}
                              </button>
                            ) : (
                              <span className="block px-0 py-1.5 font-semibold text-hielo sm:py-2.5">
                                {price}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });

                return [...section, ...dataRows];
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-muted sm:mt-5 sm:text-sm">
          {completeRateTables
            .filter((table) => table.noteEs)
            .map((table) => (
              <li key={table.id}>
                <span className="font-semibold text-pizarra">
                  {pickLocale(locale, table.titleEs, table.titleEn)}.
                </span>{" "}
                {pickLocale(locale, table.noteEs ?? "", table.noteEn ?? "")}
              </li>
            ))}
        </ul>
      </div>

      {bookingSelection ? (
        <AddToCartModal
          key={`${bookingSelection.productId}-${bookingSelection.timeSlotId}-${bookingSelection.participants}`}
          open
          onClose={() => setBookingSelection(null)}
          productId={bookingSelection.productId}
          defaultTimeSlotId={bookingSelection.timeSlotId}
          defaultParticipants={bookingSelection.participants}
          defaultDiscipline={bookingSelection.productId === "curso-snow" ? "snowboard" : undefined}
          lockSelection
        />
      ) : null}
    </>
  );
}
