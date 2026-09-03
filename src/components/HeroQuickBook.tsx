"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMainDisciplines, type MainDisciplineId } from "@/data/disciplines";
import { parseQuickBookPeople } from "@/lib/booking-config";
import { pickLocale } from "@/lib/locale";

type HeroQuickBookProps = {
  locale: string;
};

const peopleOptions = [
  { value: "1", labelEs: "1 persona", labelEn: "1 person" },
  { value: "2", labelEs: "2 personas", labelEn: "2 people" },
  { value: "3-4", labelEs: "3–4 personas", labelEn: "3–4 people" },
  { value: "5+", labelEs: "5+ personas", labelEn: "5+ people" },
];

export function HeroQuickBook({ locale }: HeroQuickBookProps) {
  const router = useRouter();
  const [discipline, setDiscipline] = useState<MainDisciplineId>(getMainDisciplines()[0].slug);
  const [people, setPeople] = useState("2");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = parseQuickBookPeople(people) ?? 2;
    router.push(`/${locale}/clases/${discipline}?people=${count}#clases-disponibles`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xl sm:p-5"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-oro-light">
        {pickLocale(locale, "Reserva rápida", "Quick booking")}
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-nieve/85">
            {pickLocale(locale, "Disciplina", "Discipline")}
          </span>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as MainDisciplineId)}
            className="field-select field-select--dark py-2.5"
          >
            {getMainDisciplines().map((d) => (
              <option key={d.id} value={d.slug} className="bg-pizarra text-nieve">
                {pickLocale(locale, d.nameEs, d.nameEn)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-nieve/85">
            {pickLocale(locale, "Grupo", "Group")}
          </span>
          <select
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="field-select field-select--dark py-2.5"
          >
            {peopleOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-pizarra text-nieve">
                {pickLocale(locale, opt.labelEs, opt.labelEn)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="btn-primary mt-auto h-[42px] self-end !w-full sm:!w-auto sm:px-5"
        >
          {pickLocale(locale, "Ver clases", "View lessons")}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-nieve/80 sm:text-left">
        {pickLocale(
          locale,
          "Sin compromiso · Confirmamos disponibilidad por email",
          "No commitment · We confirm availability by email",
        )}
      </p>
    </form>
  );
}
