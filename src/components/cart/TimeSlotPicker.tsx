"use client";

import { useEffect, useMemo, useState } from "react";
import type { TimeSlot } from "@/lib/booking-config";
import { pickLocale } from "@/lib/locale";

type TimeSlotPickerProps = {
  locale: string;
  slots: TimeSlot[];
  value: string;
  onChange: (slotId: string) => void;
  title: string;
};

function getDurationGroups(slots: TimeSlot[]): number[] {
  return [...new Set(slots.map((slot) => slot.hours))].filter((hours) => hours > 0).sort((a, b) => a - b);
}

export function TimeSlotPicker({ locale, slots, value, onChange, title }: TimeSlotPickerProps) {
  const durations = useMemo(() => getDurationGroups(slots), [slots]);
  const hasMultipleDurations = durations.length > 1;

  const [durationFilter, setDurationFilter] = useState(() => {
    const selected = slots.find((slot) => slot.id === value);
    return selected?.hours ?? durations[0] ?? 0;
  });

  useEffect(() => {
    const selected = slots.find((slot) => slot.id === value);
    if (selected && selected.hours > 0) {
      setDurationFilter(selected.hours);
    }
  }, [value, slots]);

  const visibleSlots = hasMultipleDurations
    ? slots.filter((slot) => slot.hours === durationFilter)
    : slots;

  if (slots.length <= 1) {
    const slot = slots[0];
    if (!slot) return null;
    return (
      <div>
        <p className="mb-2 text-sm font-medium">{title}</p>
        <div className="rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm font-semibold text-hielo">
          {pickLocale(locale, slot.labelEs, slot.labelEn)}
          {slot.hours > 0 && (
            <span className="ml-2 text-xs font-normal text-muted">
              · {slot.hours}h
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>

      {hasMultipleDurations && (
        <div
          className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={pickLocale(locale, "Duración de la clase", "Lesson duration")}
        >
          {durations.map((hours) => {
            const selected = durationFilter === hours;
            return (
              <button
                key={hours}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setDurationFilter(hours);
                  const firstInGroup = slots.find((slot) => slot.hours === hours);
                  if (firstInGroup && value !== firstInGroup.id) {
                    const current = slots.find((slot) => slot.id === value);
                    if (!current || current.hours !== hours) {
                      onChange(firstInGroup.id);
                    }
                  }
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? "bg-hielo text-white shadow-md shadow-hielo/20"
                    : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
                }`}
              >
                {hours} {pickLocale(locale, "horas", "hours")}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        {visibleSlots.map((slot) => {
          const selected = value === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChange(slot.id)}
              className={`rounded-xl border px-3.5 py-2.5 text-left transition sm:px-4 sm:py-3 ${
                selected
                  ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(232,90,53,0.35)]"
                  : "border-hielo/15 bg-white hover:border-hielo/30 hover:bg-nieve/50"
              }`}
            >
              <span className={`block text-sm font-semibold leading-snug ${selected ? "text-accent" : "text-pizarra"}`}>
                {pickLocale(locale, slot.labelEs, slot.labelEn)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
