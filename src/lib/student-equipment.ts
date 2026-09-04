import { z } from "zod";
import {
  equipmentNeeds,
  type EquipmentGearBase,
  type EquipmentSource,
  type SnowboardStance,
} from "@/data/student-account";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import type { StudentEquipment } from "@/lib/student-users";

export type EquipmentFormState = {
  source: EquipmentSource;
  bootSize: string;
  snowboardBootSize: string;
  heightCm: string;
  weightKg: string;
  skiLengthCm: string;
  poleLengthCm: string;
  boardLengthCm: string;
  stance: SnowboardStance | "";
  notes: string;
  gearBase: EquipmentGearBase | "";
};

export const equipmentSchema = z.object({
  source: z.enum(["own", "rental"]),
  bootSize: z.string().max(24),
  snowboardBootSize: z.string().max(24).optional().default(""),
  heightCm: z.number().min(50).max(250).nullable(),
  weightKg: z.number().min(10).max(250).nullable(),
  skiLengthCm: z.number().min(50).max(220).nullable().optional().default(null),
  poleLengthCm: z.number().min(50).max(160).nullable().optional().default(null),
  boardLengthCm: z.number().min(80).max(180).nullable().optional().default(null),
  stance: z.enum(["regular", "goofy"]).nullable().optional().default(null),
  notes: z.string().max(500).optional().default(""),
  gearBase: z.enum(["esqui", "snowboard"]).nullable().optional().default(null),
});

export function emptyEquipmentForm(source: EquipmentSource = "rental"): EquipmentFormState {
  return {
    source,
    bootSize: "",
    snowboardBootSize: "",
    heightCm: "",
    weightKg: "",
    skiLengthCm: "",
    poleLengthCm: "",
    boardLengthCm: "",
    stance: "",
    notes: "",
    gearBase: "",
  };
}

export function equipmentFormFromProfile(equipment: StudentEquipment | null): EquipmentFormState {
  if (!equipment) return emptyEquipmentForm();
  return {
    source: equipment.source,
    bootSize: equipment.bootSize,
    snowboardBootSize: equipment.snowboardBootSize,
    heightCm: equipment.heightCm != null ? String(equipment.heightCm) : "",
    weightKg: equipment.weightKg != null ? String(equipment.weightKg) : "",
    skiLengthCm: equipment.skiLengthCm != null ? String(equipment.skiLengthCm) : "",
    poleLengthCm: equipment.poleLengthCm != null ? String(equipment.poleLengthCm) : "",
    boardLengthCm: equipment.boardLengthCm != null ? String(equipment.boardLengthCm) : "",
    stance: equipment.stance ?? "",
    notes: equipment.notes,
    gearBase: equipment.gearBase ?? "",
  };
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function inRange(value: string, min: number, max: number): boolean {
  const parsed = optionalNumber(value);
  return parsed != null && parsed >= min && parsed <= max;
}

export function toStudentEquipment(form: EquipmentFormState): StudentEquipment {
  return {
    source: form.source,
    bootSize: form.bootSize.trim(),
    snowboardBootSize: form.snowboardBootSize.trim(),
    heightCm: optionalNumber(form.heightCm),
    weightKg: optionalNumber(form.weightKg),
    skiLengthCm: optionalNumber(form.skiLengthCm),
    poleLengthCm: optionalNumber(form.poleLengthCm),
    boardLengthCm: optionalNumber(form.boardLengthCm),
    stance: form.stance === "regular" || form.stance === "goofy" ? form.stance : null,
    notes: form.notes.trim(),
    gearBase: form.gearBase === "esqui" || form.gearBase === "snowboard" ? form.gearBase : null,
  };
}

export function isEquipmentFormComplete(
  form: EquipmentFormState,
  disciplines: ProgressDisciplineId[],
): boolean {
  const needs = equipmentNeeds(disciplines, form.gearBase);
  if (needs.showGearBase && !form.gearBase) return false;
  if (!inRange(form.heightCm, 50, 250) || !inRange(form.weightKg, 10, 250)) return false;

  const skiBoot = form.bootSize.trim();
  const boardBoot = (needs.usesSkiGear ? form.snowboardBootSize : form.bootSize).trim();
  if (needs.usesSkiGear && !skiBoot) return false;
  if (needs.usesSnowboardGear && !boardBoot) return false;
  if (!needs.usesSkiGear && !needs.usesSnowboardGear && !skiBoot) return false;

  if (needs.usesSnowboardGear && form.stance !== "regular" && form.stance !== "goofy") return false;

  if (form.source === "own") {
    if (needs.usesSkiGear && !inRange(form.skiLengthCm, 50, 220)) return false;
    if (needs.usesPoles && !inRange(form.poleLengthCm, 50, 160)) return false;
    if (needs.usesSnowboardGear && !inRange(form.boardLengthCm, 80, 180)) return false;
  }

  return true;
}

export function equipmentCopy(locale: string) {
  const en = locale === "en";
  return {
    rental: en ? "Rental" : "Alquiler",
    own: en ? "Own equipment" : "Material propio",
    measuresTitle: en ? "Your measurements" : "Tus medidas",
    measuresLeadRental: en
      ? "Height, weight and boot size are what the shop uses to pick skis or a board and set the bindings."
      : "Altura, peso y talla de bota son lo que usa el alquiler para elegir esquís o tabla y regular las fijaciones.",
    measuresLeadOwn: en
      ? "Height and weight still matter so your instructor can check that your gear matches you."
      : "Altura y peso siguen siendo importantes para que el instructor compruebe que tu material te encaja.",
    height: en ? "Height (cm)" : "Altura (cm)",
    weight: en ? "Weight (kg)" : "Peso (kg)",
    bootSki: en ? "Ski boot size" : "Talla de botas de esquí",
    bootSnowboard: en ? "Snowboard boot size" : "Talla de botas de snowboard",
    bootTelemark: en ? "Telemark boot size" : "Talla de botas de telemark",
    bootAdaptive: en ? "Boot size" : "Talla de botas",
    bootPlaceholder: "EU 42 / Mondo 27.5",
    skiSection: en ? "Ski" : "Esquí",
    snowboardSection: en ? "Snowboard" : "Snowboard",
    telemarkSection: en ? "Telemark" : "Telemark",
    adaptiveSection: en ? "Adaptive" : "Esquí adaptado",
    otherSection: en ? "Freeride / Freestyle" : "Freeride / Freestyle",
    skiLength: en ? "Ski length (cm)" : "Longitud de esquís (cm)",
    telemarkLength: en ? "Telemark ski length (cm)" : "Longitud de esquís telemark (cm)",
    adaptiveLength: en ? "Equipment length (cm)" : "Longitud del material (cm)",
    poleLength: en ? "Pole length (cm)" : "Longitud de bastones (cm)",
    boardLength: en ? "Board length (cm)" : "Longitud de tabla (cm)",
    stance: en ? "Stance" : "Posición (stance)",
    stanceLead: en
      ? "Needed to set up the board. If you are unsure, the foot you would kick a ball with usually goes at the back."
      : "Hace falta para montar la tabla. Si no lo tienes claro, el pie con el que chutarías un balón suele ir detrás.",
    rentalMaps: en ? "How to get to the rental shop" : "Cómo llegar al alquiler",
    rentalSkiHint: en
      ? "The shop will assign skis and poles from your height and weight."
      : "El alquiler te asigna esquís y bastones según tu altura y peso.",
    rentalSnowboardHint: en
      ? "The shop will assign a board from your height, weight and stance."
      : "El alquiler te asigna la tabla según tu altura, peso y stance.",
    rentalTelemarkHint: en
      ? "The shop will assign telemark skis and boots from your measurements."
      : "El alquiler te asigna esquís y botas de telemark según tus medidas.",
    rentalAdaptiveHint: en
      ? "Tell us your measurements and, if you know it, the adaptive set-up you need."
      : "Indica tus medidas y, si lo sabes, el material adaptado que necesitas.",
    rentalOtherHint: en
      ? "Your measurements let the shop match skis or a board to the discipline."
      : "Tus medidas permiten que el alquiler ajuste esquís o tabla a la disciplina.",
    ownSkiHint: en
      ? "Enter the exact lengths of your skis and poles."
      : "Indica las longitudes exactas de tus esquís y bastones.",
    ownSnowboardHint: en
      ? "Enter the exact length of your board."
      : "Indica la longitud exacta de tu tabla.",
    ownTelemarkHint: en
      ? "Enter the exact lengths of your telemark skis and poles."
      : "Indica las longitudes exactas de tus esquís y bastones de telemark.",
    ownAdaptiveHint: en
      ? "Enter the length of your sit-ski or adaptive set-up if you know it."
      : "Indica la longitud de tu sitski o material adaptado si la conoces.",
    ownOtherHint: en
      ? "Enter the lengths of the gear you will bring."
      : "Indica las longitudes del material que vas a traer.",
    adaptiveNotes: en
      ? "Adaptive set-up (sit-ski, bi-ski, outriggers…)"
      : "Material adaptado (sitski, bi-ski, estabilos…)",
    otherNotes: en
      ? "Extra gear (transceiver, shovel, probe…)"
      : "Material extra (ARVA, pala, sonda…)",
    gearBase: en ? "On skis or snowboard?" : "¿Con esquís o snowboard?",
    gearBaseSki: en ? "Skis" : "Esquís",
    gearBaseSnowboard: en ? "Snowboard" : "Snowboard",
  };
}

export function formatEquipmentSummary(
  equipment: StudentEquipment,
  disciplines: ProgressDisciplineId[],
  locale: string,
): string {
  const en = locale === "en";
  const needs = equipmentNeeds(disciplines, equipment.gearBase);
  const parts: string[] = [
    equipment.source === "rental" ? (en ? "Rental" : "Alquiler") : en ? "Own gear" : "Material propio",
  ];
  if (equipment.heightCm != null) parts.push(`${equipment.heightCm} cm`);
  if (equipment.weightKg != null) parts.push(`${equipment.weightKg} kg`);
  if (needs.usesSkiGear && equipment.bootSize) {
    parts.push(en ? `ski boots ${equipment.bootSize}` : `botas esquí ${equipment.bootSize}`);
  } else if (equipment.bootSize && !needs.usesSnowboardGear) {
    parts.push(en ? `boots ${equipment.bootSize}` : `botas ${equipment.bootSize}`);
  }
  if (needs.usesSnowboardGear) {
    const boardBoot = needs.usesSkiGear ? equipment.snowboardBootSize : equipment.bootSize;
    if (boardBoot) parts.push(en ? `board boots ${boardBoot}` : `botas snowboard ${boardBoot}`);
  }
  if (equipment.source === "own") {
    if (needs.usesSkiGear && equipment.skiLengthCm != null) {
      parts.push(en ? `skis ${equipment.skiLengthCm} cm` : `esquís ${equipment.skiLengthCm} cm`);
    }
    if (needs.usesPoles && equipment.poleLengthCm != null) {
      parts.push(en ? `poles ${equipment.poleLengthCm} cm` : `bastones ${equipment.poleLengthCm} cm`);
    }
    if (needs.usesSnowboardGear && equipment.boardLengthCm != null) {
      parts.push(en ? `board ${equipment.boardLengthCm} cm` : `tabla ${equipment.boardLengthCm} cm`);
    }
  }
  if (needs.usesSnowboardGear && equipment.stance) {
    parts.push(equipment.stance === "goofy" ? "goofy" : "regular");
  }
  return parts.join(" · ");
}
