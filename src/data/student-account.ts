import type { ProgressDisciplineId } from "./progress-skills";

export type SelfLevelId = "debutante" | "intermedio" | "avanzado" | "experto";
export type EquipmentSource = "own" | "rental";
export type CompanionRelation = "child" | "partner" | "friend";

export const ACCOUNT_MEETING_POINT_ES =
  "Salida a la nieve al llegar arriba en el Telecabina Al-Andalus (Borreguiles)";
export const ACCOUNT_MEETING_POINT_EN =
  "Snow exit at the top of the Al-Andalus gondola (Borreguiles)";

export const WIZARD_DISCIPLINES: {
  id: ProgressDisciplineId;
  nameEs: string;
  nameEn: string;
}[] = [
  { id: "esqui", nameEs: "Esquí", nameEn: "Ski" },
  { id: "snowboard", nameEs: "Snowboard", nameEn: "Snowboard" },
  { id: "telemark", nameEs: "Telemark", nameEn: "Telemark" },
  { id: "esqui-adaptado", nameEs: "Adaptado", nameEn: "Adaptive" },
  { id: "freeride", nameEs: "Freeride", nameEn: "Freeride" },
  { id: "freestyle", nameEs: "Freestyle", nameEn: "Freestyle" },
];

export const SELF_LEVELS: {
  id: SelfLevelId;
  nameEs: string;
  nameEn: string;
}[] = [
  { id: "debutante", nameEs: "Debutante", nameEn: "Beginner" },
  { id: "intermedio", nameEs: "Intermedio", nameEn: "Intermediate" },
  { id: "avanzado", nameEs: "Avanzado", nameEn: "Advanced" },
  { id: "experto", nameEs: "Experto", nameEn: "Expert" },
];

export const EQUIPMENT_SOURCES: {
  id: EquipmentSource;
  nameEs: string;
  nameEn: string;
}[] = [
  { id: "own", nameEs: "Material propio", nameEn: "Own equipment" },
  { id: "rental", nameEs: "Alquiler", nameEn: "Rental" },
];

export const COMPANION_RELATIONS: {
  id: CompanionRelation;
  nameEs: string;
  nameEn: string;
}[] = [
  { id: "child", nameEs: "Hijo/a", nameEn: "Child" },
  { id: "partner", nameEs: "Pareja", nameEn: "Partner" },
  { id: "friend", nameEs: "Amigo/a", nameEn: "Friend" },
];

export function selfLevelName(id: SelfLevelId, locale: string): string {
  const row = SELF_LEVELS.find((item) => item.id === id);
  if (!row) return id;
  return locale === "en" ? row.nameEn : row.nameEs;
}
