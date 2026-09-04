"use client";

import type { ReactNode } from "react";

import {
  EQUIPMENT_SOURCES,
  SNOWBOARD_STANCES,
  equipmentNeeds,
  type EquipmentGearBase,
} from "@/data/student-account";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { site } from "@/data/site";
import { equipmentCopy, type EquipmentFormState } from "@/lib/student-equipment";

type StudentEquipmentFieldsProps = {
  locale: string;
  disciplines: ProgressDisciplineId[];
  values: EquipmentFormState;
  onChange: (patch: Partial<EquipmentFormState>) => void;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-pizarra">
      {label}
      {required ? <span className="text-accent"> *</span> : null}
      {children}
    </label>
  );
}

function inputClass() {
  return "mt-1 w-full rounded-xl border border-hielo/15 bg-white px-3 py-2";
}

export function StudentEquipmentFields({
  locale,
  disciplines,
  values,
  onChange,
}: StudentEquipmentFieldsProps) {
  const copy = equipmentCopy(locale);
  const needs = equipmentNeeds(disciplines, values.gearBase);
  const rental = values.source === "rental";
  const bothBoots = needs.usesSkiGear && needs.usesSnowboardGear;
  const skiBootLabel =
    needs.skiLengthLabel === "telemark"
      ? copy.bootTelemark
      : needs.skiLengthLabel === "adaptive"
        ? copy.bootAdaptive
        : copy.bootSki;
  const skiLengthLabel =
    needs.skiLengthLabel === "telemark"
      ? copy.telemarkLength
      : needs.skiLengthLabel === "adaptive"
        ? copy.adaptiveLength
        : copy.skiLength;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {EQUIPMENT_SOURCES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange({ source: item.id })}
            className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
              values.source === item.id
                ? "border-hielo bg-hielo text-white"
                : "border-hielo/15 bg-nieve text-pizarra"
            }`}
          >
            {locale === "en" ? item.nameEn : item.nameEs}
          </button>
        ))}
      </div>
      {rental ? (
        <a
          href={site.rentalPartner.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-hielo underline-offset-2 hover:underline"
        >
          {copy.rentalMaps}
        </a>
      ) : null}

      <div className="rounded-2xl border border-hielo/10 bg-nieve/60 p-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-hielo">
          {copy.measuresTitle}
        </p>
        <p className="mt-1 text-sm text-muted">
          {rental ? copy.measuresLeadRental : copy.measuresLeadOwn}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label={copy.height} required>
            <input
              type="number"
              min={50}
              max={250}
              inputMode="numeric"
              value={values.heightCm}
              onChange={(event) => onChange({ heightCm: event.target.value })}
              className={inputClass()}
              placeholder="170"
            />
          </Field>
          <Field label={copy.weight} required>
            <input
              type="number"
              min={10}
              max={250}
              inputMode="numeric"
              value={values.weightKg}
              onChange={(event) => onChange({ weightKg: event.target.value })}
              className={inputClass()}
              placeholder="65"
            />
          </Field>
        </div>
        <div className={`mt-3 grid gap-3 ${bothBoots ? "sm:grid-cols-2" : ""}`}>
          {needs.usesSkiGear || !needs.usesSnowboardGear ? (
            <Field label={skiBootLabel} required>
              <input
                value={values.bootSize}
                onChange={(event) => onChange({ bootSize: event.target.value })}
                className={inputClass()}
                placeholder={copy.bootPlaceholder}
              />
            </Field>
          ) : (
            <Field label={copy.bootSnowboard} required>
              <input
                value={values.bootSize}
                onChange={(event) => onChange({ bootSize: event.target.value })}
                className={inputClass()}
                placeholder={copy.bootPlaceholder}
              />
            </Field>
          )}
          {bothBoots ? (
            <Field label={copy.bootSnowboard} required>
              <input
                value={values.snowboardBootSize}
                onChange={(event) => onChange({ snowboardBootSize: event.target.value })}
                className={inputClass()}
                placeholder={copy.bootPlaceholder}
              />
            </Field>
          ) : null}
        </div>
        <div className="mt-3">
          <Field label={copy.helmet}>
            <input
              value={values.helmetSize}
              onChange={(event) => onChange({ helmetSize: event.target.value })}
              className={inputClass()}
              placeholder={copy.helmetPlaceholder}
            />
          </Field>
        </div>
      </div>

      {needs.showGearBase ? (
        <div className="rounded-2xl border border-hielo/10 bg-nieve/60 p-4">
          <p className="text-sm font-semibold text-pizarra">
            {copy.gearBase}
            <span className="text-accent"> *</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["esqui", "snowboard"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ gearBase: id satisfies EquipmentGearBase })}
                className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                  values.gearBase === id
                    ? "border-hielo bg-hielo text-white"
                    : "border-hielo/15 bg-white text-pizarra"
                }`}
              >
                {id === "esqui" ? copy.gearBaseSki : copy.gearBaseSnowboard}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">{rental ? copy.rentalOtherHint : copy.ownOtherHint}</p>
        </div>
      ) : null}

      {needs.usesSkiGear ? (
        <GearSection
          title={
            disciplines.includes("esqui") && needs.showTelemark
              ? `${copy.skiSection} / ${copy.telemarkSection}`
              : needs.showTelemark && !disciplines.includes("esqui")
                ? copy.telemarkSection
                : needs.showAdaptive && !disciplines.includes("esqui") && !needs.showTelemark
                  ? copy.adaptiveSection
                  : copy.skiSection
          }
          hint={
            rental
              ? needs.showTelemark && !disciplines.includes("esqui")
                ? copy.rentalTelemarkHint
                : needs.showAdaptive && !disciplines.includes("esqui")
                  ? copy.rentalAdaptiveHint
                  : copy.rentalSkiHint
              : needs.showTelemark && !disciplines.includes("esqui")
                ? copy.ownTelemarkHint
                : needs.showAdaptive && !disciplines.includes("esqui")
                  ? copy.ownAdaptiveHint
                  : copy.ownSkiHint
          }
        >
          {rental ? null : (
            <div className={`grid gap-3 ${needs.usesPoles ? "grid-cols-2" : ""}`}>
              <Field label={skiLengthLabel} required>
                <input
                  type="number"
                  min={50}
                  max={220}
                  inputMode="numeric"
                  value={values.skiLengthCm}
                  onChange={(event) => onChange({ skiLengthCm: event.target.value })}
                  className={inputClass()}
                  placeholder="165"
                />
              </Field>
              {needs.usesPoles ? (
                <Field label={copy.poleLength} required>
                  <input
                    type="number"
                    min={50}
                    max={160}
                    inputMode="numeric"
                    value={values.poleLengthCm}
                    onChange={(event) => onChange({ poleLengthCm: event.target.value })}
                    className={inputClass()}
                    placeholder="120"
                  />
                </Field>
              ) : null}
            </div>
          )}
        </GearSection>
      ) : null}

      {needs.usesSnowboardGear ? (
        <GearSection
          title={copy.snowboardSection}
          hint={rental ? copy.rentalSnowboardHint : copy.ownSnowboardHint}
        >
          <p className="text-sm font-medium text-pizarra">
            {copy.stance}
            <span className="text-accent"> *</span>
          </p>
          <p className="mt-1 text-xs text-muted">{copy.stanceLead}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SNOWBOARD_STANCES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ stance: item.id })}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                  values.stance === item.id
                    ? "border-hielo bg-hielo text-white"
                    : "border-hielo/15 bg-white text-pizarra"
                }`}
              >
                {locale === "en" ? item.nameEn : item.nameEs}
                <span className={`mt-0.5 block text-xs font-medium ${values.stance === item.id ? "text-white/80" : "text-muted"}`}>
                  {locale === "en" ? item.hintEn : item.hintEs}
                </span>
              </button>
            ))}
          </div>
          {rental ? null : (
            <div className="mt-3">
              <Field label={copy.boardLength} required>
                <input
                  type="number"
                  min={80}
                  max={180}
                  inputMode="numeric"
                  value={values.boardLengthCm}
                  onChange={(event) => onChange({ boardLengthCm: event.target.value })}
                  className={inputClass()}
                  placeholder="155"
                />
              </Field>
            </div>
          )}
        </GearSection>
      ) : null}

      {needs.showAdaptive ? (
        <Field label={copy.adaptiveNotes}>
          <textarea
            value={values.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            rows={3}
            className={inputClass()}
          />
        </Field>
      ) : needs.showOtherNotes ? (
        <Field label={copy.otherNotes}>
          <textarea
            value={values.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            rows={3}
            className={inputClass()}
          />
        </Field>
      ) : null}
    </div>
  );
}

function GearSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hielo/10 bg-nieve/60 p-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-hielo">{title}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
