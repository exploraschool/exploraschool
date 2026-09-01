"use client";

import type { TimeSlot } from "@/lib/booking-config";
import { pickLocale } from "@/lib/locale";

type TimeSlotPickerProps = {
  locale: string;
  slots: TimeSlot[];
  value: string;
  onChange: (slotId: string) => void;
  title: string;
};

export function TimeSlotPicker({ locale, slots, value, onChange, title }: TimeSlotPickerProps) {
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
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.map((slot) => {
          const selected = value === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChange(slot.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(232,90,53,0.35)]"
                  : "border-hielo/15 bg-white hover:border-hielo/30 hover:bg-nieve/50"
              }`}
            >
              <span className={`block text-sm font-semibold ${selected ? "text-accent" : "text-pizarra"}`}>
                {pickLocale(locale, slot.labelEs, slot.labelEn)}
              </span>
              {slot.hours > 0 && (
                <span className="mt-0.5 block text-xs text-muted">
                  {slot.hours} {pickLocale(locale, "horas", "hours")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
