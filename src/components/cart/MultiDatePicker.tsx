"use client";

import { useEffect, useMemo, useState } from "react";
import {
  areConsecutiveDates,
  fillDateRange,
  formatCartDate,
  getMaxBookingDate,
  getMinBookingDate,
} from "@/lib/cart";
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
  minDays?: number;
  maxDays?: number;
  requireConsecutiveDays?: boolean;
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
  minDays,
  maxDays,
  requireConsecutiveDays = false,
}: MultiDatePickerProps) {
  const min = getMinBookingDate();
  const max = getMaxBookingDate();
  const todayKey = getMinBookingDate();

  const [view, setView] = useState(() => getInitialViewMonth(dates));
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const weekdays = locale === "es" ? WEEKDAY_LABELS.es : WEEKDAY_LABELS.en;

  useEffect(() => {
    if (dates.length === 0) {
      setRangeAnchor(null);
      setHoverDate(null);
    }
  }, [dates]);

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

  const highlightedDates = useMemo(() => {
    if (!requireConsecutiveDays) return sortedDates;

    if (rangeAnchor && hoverDate && sortedDates.length <= 1) {
      const start = rangeAnchor < hoverDate ? rangeAnchor : hoverDate;
      const end = rangeAnchor < hoverDate ? hoverDate : rangeAnchor;
      return fillDateRange(start, end);
    }

    return sortedDates;
  }, [requireConsecutiveDays, rangeAnchor, hoverDate, sortedDates]);

  const selectionValid =
    dates.length > 0 &&
    (!minDays || dates.length >= minDays) &&
    (!maxDays || dates.length <= maxDays) &&
    (!requireConsecutiveDays || areConsecutiveDates(dates));

  const durationOptions = useMemo(() => {
    if (!requireConsecutiveDays || !minDays || !maxDays) return [];
    return Array.from({ length: maxDays - minDays + 1 }, (_, index) => minDays + index);
  }, [maxDays, minDays, requireConsecutiveDays]);

  const courseStartDate = rangeAnchor ?? sortedDates[0] ?? null;

  function isDisabled(dateKey: string): boolean {
    return dateKey < min || dateKey > max;
  }

  function clearSelection() {
    onChange([]);
    setRangeAnchor(null);
    setHoverDate(null);
  }

  function applyDuration(dayCount: number) {
    if (!courseStartDate) return;

    const range = fillDateRange(courseStartDate, addDays(courseStartDate, dayCount - 1));
    if (range.some((dateKey) => isDisabled(dateKey))) return;

    onChange(range);
    setRangeAnchor(null);
    setHoverDate(null);
  }

  function toggleDate(dateKey: string) {
    if (isDisabled(dateKey)) return;

    if (requireConsecutiveDays) {
      if (dates.length >= (minDays ?? 1) && areConsecutiveDates(dates) && dates.includes(dateKey)) {
        clearSelection();
        return;
      }

      if (!rangeAnchor && dates.length === 0) {
        setRangeAnchor(dateKey);
        onChange([dateKey]);
        return;
      }

      const anchor = rangeAnchor ?? sortedDates[0];
      if (!anchor) {
        setRangeAnchor(dateKey);
        onChange([dateKey]);
        return;
      }

      if (dateKey === anchor && dates.length === 1) {
        clearSelection();
        return;
      }

      const start = anchor < dateKey ? anchor : dateKey;
      const end = anchor < dateKey ? dateKey : anchor;
      const range = fillDateRange(start, end);

      if (range.some((day) => isDisabled(day))) return;

      if (maxDays && range.length > maxDays) {
        setRangeAnchor(dateKey);
        onChange([dateKey]);
        setHoverDate(null);
        return;
      }

      onChange(range);
      setRangeAnchor(null);
      setHoverDate(null);
      return;
    }

    if (dates.includes(dateKey)) {
      onChange(dates.filter((d) => d !== dateKey));
      return;
    }

    if (maxDays && dates.length >= maxDays) return;
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
    if (requireConsecutiveDays) {
      clearSelection();
      return;
    }
    onChange(dates.filter((d) => d !== date));
  }

  const statusMessage = (() => {
    if (dates.length === 0) return null;
    if (requireConsecutiveDays && !areConsecutiveDates(dates)) {
      return pickLocale(locale, "Los días deben ser consecutivos.", "Days must be consecutive.");
    }
    if (minDays && dates.length < minDays) {
      const remaining = minDays - dates.length;
      return pickLocale(
        locale,
        `Selecciona ${remaining} día(s) más (mínimo ${minDays} consecutivos).`,
        `Select ${remaining} more consecutive day(s) (minimum ${minDays}).`,
      );
    }
    if (maxDays && dates.length > maxDays) {
      return pickLocale(
        locale,
        `Máximo ${maxDays} días consecutivos.`,
        `Maximum ${maxDays} consecutive days.`,
      );
    }
    if (requireConsecutiveDays && selectionValid) {
      return pickLocale(
        locale,
        `${dates.length} días consecutivos seleccionados.`,
        `${dates.length} consecutive days selected.`,
      );
    }
    if (maxDays && dates.length >= maxDays) {
      return pickLocale(
        locale,
        `Has alcanzado el máximo de ${maxDays} días.`,
        `You have reached the maximum of ${maxDays} days.`,
      );
    }
    return null;
  })();

  const helperMessage =
    requireConsecutiveDays && dates.length === 0
      ? pickLocale(locale, "Elige el primer día del curso en el calendario.", "Choose the first day of the course on the calendar.")
      : requireConsecutiveDays && dates.length === 1
        ? pickLocale(
            locale,
            "Ahora elige el último día, o pulsa una duración.",
            "Now choose the last day, or tap a duration.",
          )
        : null;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{labels.title}</label>
      <p className="mb-3 text-xs text-muted">{labels.hint}</p>

      {requireConsecutiveDays && durationOptions.length > 0 && courseStartDate && dates.length < (minDays ?? 2) && (
        <div className="mb-4 rounded-xl border border-hielo/10 bg-nieve/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-hielo">
            {pickLocale(locale, "Duración del curso", "Course length")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {durationOptions.map((dayCount) => (
              <button
                key={dayCount}
                type="button"
                onClick={() => applyDuration(dayCount)}
                className="rounded-full border border-hielo/15 bg-white px-3 py-1.5 text-sm font-semibold text-hielo transition hover:border-accent/30 hover:text-accent"
              >
                {pickLocale(locale, `${dayCount} días`, `${dayCount} days`)}
              </button>
            ))}
          </div>
        </div>
      )}

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

          <div
            className="grid grid-cols-7 gap-1 p-2.5 sm:gap-1.5 sm:p-3"
            onMouseLeave={() => setHoverDate(null)}
          >
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
              const inRange = highlightedDates.includes(dateKey);
              const isCommitted = dates.includes(dateKey);
              const isPreview = inRange && !isCommitted;
              const disabled = isDisabled(dateKey);
              const atMax = !requireConsecutiveDays && !inRange && maxDays !== undefined && dates.length >= maxDays;
              const isToday = dateKey === todayKey;
              const isAnchor = requireConsecutiveDays && (rangeAnchor === dateKey || (dates.length === 1 && dates[0] === dateKey));

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={disabled || atMax}
                  onClick={() => toggleDate(dateKey)}
                  onMouseEnter={() => {
                    if (requireConsecutiveDays && (rangeAnchor || dates.length === 1)) {
                      setHoverDate(dateKey);
                    }
                  }}
                  aria-pressed={inRange}
                  aria-label={formatCartDate(dateKey, locale)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-semibold leading-none transition sm:h-11 sm:rounded-xl sm:text-[0.9375rem] ${
                    isCommitted
                      ? "bg-accent-dark text-white shadow-md shadow-accent-dark/25"
                      : isPreview
                        ? "bg-accent/20 text-accent"
                        : disabled || atMax
                          ? "cursor-not-allowed text-muted/30"
                          : "text-pizarra hover:bg-hielo/8 active:scale-[0.97]"
                  } ${isToday && !inRange ? "ring-2 ring-hielo/30 ring-inset" : ""} ${
                    isAnchor && !isPreview ? "ring-2 ring-accent/40 ring-inset" : ""
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {helperMessage && dates.length <= 1 ? (
        <p className="mt-3 text-xs font-medium text-hielo">{helperMessage}</p>
      ) : null}

      {dates.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              {pickLocale(locale, "Días seleccionados", "Selected days")} ({dates.length}
              {minDays || maxDays
                ? ` · ${pickLocale(
                    locale,
                    minDays && maxDays
                      ? `mín. ${minDays}, máx. ${maxDays}`
                      : minDays
                        ? `mín. ${minDays}`
                        : `máx. ${maxDays}`,
                    minDays && maxDays
                      ? `min ${minDays}, max ${maxDays}`
                      : minDays
                        ? `min ${minDays}`
                        : `max ${maxDays}`,
                  )}`
                : ""}
              )
            </p>
            {selectionValid && (
              <span className="text-xs font-semibold text-hielo">
                {pickLocale(locale, "Listo", "Ready")}
              </span>
            )}
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
                  aria-label={pickLocale(locale, "Quitar selección", "Clear selection")}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {statusMessage && (
            <p
              className={`mt-2 text-xs font-medium ${selectionValid ? "text-hielo" : "text-accent"}`}
              role="status"
            >
              {statusMessage}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-hielo/20 bg-nieve/50 px-4 py-3 text-center text-xs text-muted">
          {labels.empty}
        </p>
      )}
    </div>
  );
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]!;
}
