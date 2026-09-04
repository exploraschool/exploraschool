export type ProgressDisciplineId =
  | "esqui"
  | "snowboard"
  | "telemark"
  | "esqui-adaptado"
  | "freeride"
  | "freestyle";

export type ProgressSkill = {
  id: string;
  labelEs: string;
  labelEn: string;
};

export const PROGRESS_DISCIPLINES: {
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

export const PROGRESS_SKILLS: Record<ProgressDisciplineId, ProgressSkill[]> = {
  esqui: [
    { id: "control-velocidad", labelEs: "Control de velocidad", labelEn: "Speed control" },
    { id: "viraje-cuna", labelEs: "Viraje en cuña", labelEn: "Wedge turn" },
    { id: "paralelo-elemental", labelEs: "Paralelo elemental", labelEn: "Elementary parallel" },
    { id: "carving", labelEs: "Carving", labelEn: "Carving" },
    { id: "apoyo-baston", labelEs: "Apoyo de bastón", labelEn: "Pole plant" },
    { id: "independencia-piernas", labelEs: "Independencia de piernas", labelEn: "Leg independence" },
  ],
  snowboard: [
    { id: "diagonales", labelEs: "Diagonales", labelEn: "Traverses" },
    { id: "derrape", labelEs: "Derrape / hoja caída", labelEn: "Sideslip / falling leaf" },
    { id: "viraje-guiado", labelEs: "Viraje guiado", labelEn: "Guided turn" },
    { id: "carving", labelEs: "Carving", labelEn: "Carving" },
    { id: "switch", labelEs: "Switch", labelEn: "Switch" },
  ],
  telemark: [
    { id: "posicion-base", labelEs: "Posición base", labelEn: "Base position" },
    { id: "cambio-pie", labelEs: "Cambio de pie / ritmo", labelEn: "Lead change / rhythm" },
    { id: "viraje-telemark", labelEs: "Viraje telemark", labelEn: "Telemark turn" },
    { id: "control-cantos", labelEs: "Control de cantos", labelEn: "Edge control" },
  ],
  "esqui-adaptado": [
    { id: "estabilos", labelEs: "Estabilos", labelEn: "Outriggers" },
    { id: "transferencias", labelEs: "Transferencias en silla (mono/bisquí)", labelEn: "Sit-ski transfers (mono/bi-ski)" },
    { id: "giros-autonomos", labelEs: "Giros autónomos", labelEn: "Independent turns" },
    { id: "remontes", labelEs: "Uso de remontes", labelEn: "Lift use" },
  ],
  freeride: [
    { id: "lectura-terreno", labelEs: "Lectura de terreno", labelEn: "Terrain reading" },
    { id: "viraje-flotado", labelEs: "Viraje flotado", labelEn: "Floating turn" },
    { id: "tipos-nieve", labelEs: "Gestión de tipos de nieve", labelEn: "Snow-type management" },
    { id: "seguridad-arva", labelEs: "Seguridad / ARVA / pala / sonda", labelEn: "Safety / transceiver / shovel / probe" },
  ],
  freestyle: [
    { id: "despegue-recepcion", labelEs: "Postura de despegue / recepción", labelEn: "Take-off / landing stance" },
    { id: "saltos-basicos", labelEs: "Saltos básicos", labelEn: "Basic jumps" },
    { id: "cajas-rails", labelEs: "Cajas / rails", labelEn: "Boxes / rails" },
    { id: "rotaciones", labelEs: "Rotaciones", labelEn: "Rotations" },
    { id: "switch", labelEs: "Switch", labelEn: "Switch" },
  ],
};

export function isProgressDiscipline(id: string): id is ProgressDisciplineId {
  return id in PROGRESS_SKILLS;
}

export function progressDisciplineName(id: ProgressDisciplineId, locale: string): string {
  const row = PROGRESS_DISCIPLINES.find((item) => item.id === id);
  if (!row) return id;
  return locale === "en" ? row.nameEn : row.nameEs;
}
