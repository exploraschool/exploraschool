"use client";

import { useId, useState } from "react";
import { getMainDisciplines, type MainDisciplineId } from "@/data/disciplines";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import {
  clampParticipantCount,
  parseQuickBookPeople,
} from "@/lib/booking-config";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR, PEOPLE_COUNT_HEADERS_EN, PEOPLE_COUNT_HEADERS_ES } from "@/lib/lesson-pricing";
import { GlassSelect } from "@/components/GlassSelect";

type HeroQuickBookProps = {
  locale: string;
};

const peopleOptions = PEOPLE_COUNT_HEADERS_ES.map((_, index) => {
  const n = String(index + 1);
  return { value: n, labelEs: PEOPLE_COUNT_HEADERS_ES[index], labelEn: PEOPLE_COUNT_HEADERS_EN[index] };
});

function bookingDiscipline(id: MainDisciplineId): MainDisciplineId {
  return id === "ninos" ? "esqui" : id;
}

export function HeroQuickBook({ locale }: HeroQuickBookProps) {
  const disciplineLabelId = useId();
  const peopleLabelId = useId();
  const [discipline, setDiscipline] = useState<MainDisciplineId>(getMainDisciplines()[0].slug);
  const [people, setPeople] = useState("2");
  const [bookingOpen, setBookingOpen] = useState(false);
  const disciplines = getMainDisciplines();
  const resolvedDiscipline = bookingDiscipline(discipline);
  const participants = clampParticipantCount(
    parseQuickBookPeople(people) ?? 2,
    "particular",
    resolvedDiscipline,
  );

  function handleBook() {
    setBookingOpen(true);
  }

  return (
    <>
      <div
        className="relative w-full min-w-0 max-w-xl overflow-visible rounded-2xl border border-white/15 bg-white/10 p-4 pt-4 backdrop-blur-xl sm:p-5 sm:pt-5"
      >
        <div
          className="hero-offer-sticker"
          role="img"
          aria-label={pickLocale(
            locale,
            `Desde ${FULL_DAY_HOURLY_EUR} euros la hora en jornada completa`,
            `From €${FULL_DAY_HOURLY_EUR} per hour on a full day`,
          )}
        >
          <span className="hero-offer-sticker__face" aria-hidden="true">
            <span className="hero-offer-sticker__kicker">
              {pickLocale(locale, "Desde", "From")}
            </span>
            <span className="hero-offer-sticker__price">
              {FULL_DAY_HOURLY_EUR}€
            </span>
          </span>
        </div>

        <p className="mb-3 pr-16 text-[0.7rem] font-bold uppercase tracking-wider text-oro-light sm:mb-3 sm:text-xs">
          {pickLocale(locale, "Reserva rápida", "Quick booking")}
        </p>

        <div className="grid grid-cols-2 items-end gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:gap-2">
          <div className="min-w-0">
            <span
              id={disciplineLabelId}
              className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-wider text-nieve/85 sm:text-xs"
            >
              {pickLocale(locale, "Disciplina", "Discipline")}
            </span>
            <GlassSelect
              compact
              labelledBy={disciplineLabelId}
              title={pickLocale(locale, "Disciplina", "Discipline")}
              closeLabel={pickLocale(locale, "Cerrar", "Close")}
              value={discipline}
              onChange={setDiscipline}
              options={disciplines.map((d) => ({
                value: d.slug,
                label: pickLocale(locale, d.nameEs, d.nameEn),
              }))}
            />
          </div>

          <div className="min-w-0">
            <span
              id={peopleLabelId}
              className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-wider text-nieve/85 sm:text-xs"
            >
              {pickLocale(locale, "Grupo", "Group")}
            </span>
            <GlassSelect
              compact
              labelledBy={peopleLabelId}
              title={pickLocale(locale, "Grupo", "Group")}
              closeLabel={pickLocale(locale, "Cerrar", "Close")}
              value={people}
              onChange={setPeople}
              options={peopleOptions.map((opt) => ({
                value: opt.value,
                label: pickLocale(locale, opt.labelEs, opt.labelEn),
              }))}
            />
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="btn-primary col-span-2 mt-1.5 h-11 !w-full py-0 sm:col-span-1 sm:mt-auto sm:h-11 sm:!w-auto sm:px-5"
          >
            {pickLocale(locale, "Reservar", "Book")}
          </button>
        </div>

        <p className="mt-2.5 text-center text-[0.7rem] leading-snug text-nieve/80 sm:mt-3 sm:text-left sm:text-xs">
          {pickLocale(
            locale,
            "Sin compromiso · Confirmamos por email",
            "No commitment · We confirm by email",
          )}
        </p>
      </div>

      <AddToCartModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        productId="particular"
        defaultDiscipline={resolvedDiscipline}
        defaultParticipants={participants}
      />
    </>
  );
}
