export type PistaLevel = "green" | "blue" | "red" | "black";

export type Pista = {
  id: string;
  name: string;
  level: PistaLevel;
};

export const SIERRA_NEVADA_PISTAS: Pista[] = [
  { id: "el-rio", name: "El Río", level: "green" },
  { id: "pradollano", name: "Pradollano", level: "green" },
  { id: "borreguiles", name: "Borreguiles", level: "green" },
  { id: "monachil", name: "Monachil", level: "green" },
  { id: "veleta", name: "Veleta", level: "blue" },
  { id: "laguna", name: "Laguna", level: "blue" },
  { id: "parador", name: "Parador", level: "blue" },
  { id: "stadium", name: "Stadium", level: "blue" },
  { id: "llano-nieve", name: "Llano de la Nieve", level: "blue" },
  { id: "monument", name: "Monument", level: "red" },
  { id: "jara", name: "Jara", level: "red" },
  { id: "dilar", name: "Dílar", level: "red" },
  { id: "lagunillo", name: "Lagunillo Largo", level: "red" },
  { id: "visera", name: "Visera", level: "red" },
  { id: "aguila", name: "Águila", level: "black" },
  { id: "piramide", name: "Pirámide", level: "black" },
  { id: "tajo-de-la-cruz", name: "Tajo de la Cruz", level: "black" },
];

export const PISTA_LEVEL_LABEL: Record<PistaLevel, { es: string; en: string }> = {
  green: { es: "Verde", en: "Green" },
  blue: { es: "Azul", en: "Blue" },
  red: { es: "Roja", en: "Red" },
  black: { es: "Negra", en: "Black" },
};

export function getPistaById(id: string): Pista | undefined {
  return SIERRA_NEVADA_PISTAS.find((pista) => pista.id === id);
}
