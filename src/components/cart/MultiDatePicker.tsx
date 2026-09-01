"use client";

import { useState } from "react";
import { getMaxBookingDate, getMinBookingDate, formatCartDate } from "@/lib/cart";
import { pickLocale } from "@/lib/locale";

type MultiDatePickerProps = {
  locale: string;
  dates: string[];
  onChange: (dates: string[]) => void;
  labels: {
    title: string;
    hint: string;
    add: string;
    empty: string;
  };
};

export function MultiDatePicker({ locale, dates, onChange, labels }: MultiDatePickerProps) {
  const [draft, setDraft] = useState("");
  const min = getMinBookingDate();
  const max = getMaxBookingDate();

  function addDate() {
    if (!draft || dates.includes(draft)) return;
    onChange([...dates, draft].sort());
    setDraft("");
  }

  function removeDate(date: string) {
    onChange(dates.filter((d) => d !== date));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{labels.title}</label>
      <p className="mb-3 text-xs text-muted">{labels.hint}</p>

      <div className="flex gap-2">
        <input
          type="date"
          min={min}
          max={max}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
        />
        <button
          type="button"
          onClick={addDate}
          disabled={!draft}
          className="shrink-0 rounded-xl bg-hielo px-4 py-3 text-sm font-semibold text-white transition hover:bg-hielo/90 disabled:opacity-40"
        >
          {labels.add}
        </button>
      </div>

      {dates.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {dates.map((date) => (
            <span
              key={date}
              className="inline-flex items-center gap-2 rounded-full border border-hielo/15 bg-white px-3 py-1.5 text-sm font-medium text-pizarra shadow-sm"
            >
              {formatCartDate(date, locale)}
              <button
                type="button"
                onClick={() => removeDate(date)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-accent/10 hover:text-accent"
                aria-label={pickLocale(locale, "Quitar día", "Remove day")}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-hielo/20 bg-nieve/50 px-4 py-3 text-center text-xs text-muted">
          {labels.empty}
        </p>
      )}
    </div>
  );
}
