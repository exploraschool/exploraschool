"use client";

import { useMemo, useState } from "react";
import { formatCartDate, getMaxBookingDate, getMinBookingDate } from "@/lib/cart";
import { pickLocale } from "@/lib/locale";

type MultiDatePickerProps = {
  locale: string;
  dates: string[];
  onChange: (dates: string[]) => void;
  labels: {
    title: string;
    hint: string;
    empty: string;
  };
  /** Extra unavailable dates (e.g. too close to class start for the selected slot). */
  isDateUnavailable?: (dateKey: string) => boolean;
};

const CALENDAR_ROWS = 6;
const CALENDAR_CELLS = CALENDAR_ROWS * 7;

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseMonthFromKey(dateKey: string): { year: number; month: number } {
  const [year, month] = dateKey.split("-").map(Number);
  return { year: year!, month: month! - 1 };
}

function getInitialViewMonth(dates: string[]): { year: number; month: number } {
  if (dates.length > 0) {
    return parseMonthFromKey(dates[0]!);
  }
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

const WEEKDAY_LABELS = {
  es: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
} as const;

export function MultiDatePicker({
  locale,
  dates,
  onChange,
  labels,
  isDateUnavailable,
}: MultiDatePickerProps) {
  const min = getMinBookingDate();
  const max = getMaxBookingDate();
  const todayKey = getMinBookingDate();

  const [view, setView] = useState(() => getInitialViewMonth(dates));
  const weekdays = locale === "es" ? WEEKDAY_LABELS.es : WEEKDAY_LABELS.en;

  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
      month: "long",
      year: "numeric",
    });
    return formatter.format(new Date(view.year, view.month, 1));
  }, [locale, view.month, view.year]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(view.year, view.month, 1);
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const mondayBasedOffset = (firstOfMonth.getDay() + 6) % 7;

    const cells: ({ day: number; dateKey: string } | null)[] = [];
    for (let i = 0; i < mondayBasedOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, dateKey: toDateKey(view.year, view.month, day) });
    }
    while (cells.length < CALENDAR_CELLS) cells.push(null);
    return cells;
  }, [view.month, view.year]);

  const sortedDates = useMemo(() => [...dates].sort(), [dates]);

  function isDisabled(dateKey: string): boolean {
    return dateKey < min || dateKey > max || Boolean(isDateUnavailable?.(dateKey));
  }

  function toggleDate(dateKey: string) {
    if (isDisabled(dateKey)) return;

    if (dates.includes(dateKey)) {
      onChange(dates.filter((d) => d !== dateKey));
      return;
    }

    onChange([...dates, dateKey].sort());
  }

  function goToPrevMonth() {
    setView((current) => {
      const date = new Date(current.year, current.month - 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function goToNextMonth() {
    setView((current) => {
      const date = new Date(current.year, current.month + 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function removeDate(date: string) {
    onChange(dates.filter((d) => d !== date));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{labels.title}</label>
      <p className="mb-3 text-xs text-muted">{labels.hint}</p>

      <div className="mx-auto w-full max-w-full sm:max-w-[21.5rem]">
        <div className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <div className="flex items-center justify-between border-b border-hielo/10 bg-nieve/60 px-2.5 py-2.5 sm:px-3 sm:py-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hielo/15 text-hielo transition hover:border-hielo/30 hover:bg-white"
              aria-label={pickLocale(locale, "Mes anterior", "Previous month")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <p className="px-2 text-center font-display text-base font-semibold capitalize leading-tight text-hielo">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hielo/15 text-hielo transition hover:border-hielo/30 hover:bg-white"
              aria-label={pickLocale(locale, "Mes siguiente", "Next month")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 p-2.5 sm:gap-1.5 sm:p-3">
            {weekdays.map((label) => (
              <div
                key={label}
                className="flex h-7 items-center justify-center text-[0.625rem] font-bold uppercase tracking-wide text-muted sm:h-8 sm:text-[0.6875rem]"
              >
                {label}
              </div>
            ))}

            {calendarDays.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-9 sm:h-11" aria-hidden />;
              }

              const { day, dateKey } = cell;
              const isCommitted = dates.includes(dateKey);
              const disabled = isDisabled(dateKey);
              const isToday = dateKey === todayKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleDate(dateKey)}
                  aria-pressed={isCommitted}
                  aria-label={formatCartDate(dateKey, locale)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-semibold leading-none transition sm:h-11 sm:rounded-xl sm:text-[0.9375rem] ${
                    isCommitted
                      ? "bg-accent-dark text-white shadow-md shadow-accent-dark/25"
                      : disabled
                        ? "cursor-not-allowed text-muted/30"
                        : "text-pizarra hover:bg-hielo/8 active:scale-[0.97]"
                  } ${isToday && !isCommitted ? "ring-2 ring-hielo/30 ring-inset" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {dates.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              {pickLocale(locale, "Días seleccionados", "Selected days")} ({dates.length})
            </p>
            <span className="text-xs font-semibold text-hielo">
              {pickLocale(locale, "Listo", "Ready")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedDates.map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm font-medium text-pizarra"
              >
                {formatCartDate(date, locale)}
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-accent transition hover:bg-accent/10"
                  aria-label={pickLocale(locale, "Quitar día", "Remove day")}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-hielo/20 bg-nieve/50 px-4 py-3 text-center text-xs text-muted">
          {labels.empty}
        </p>
      )}
    </div>
  );
}
