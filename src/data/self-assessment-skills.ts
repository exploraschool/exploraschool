import type { ProgressDisciplineId } from "@/data/progress-skills";
import type { SelfLevelId } from "@/data/student-account";
import { SELF_LEVELS } from "@/data/student-account";

export type SelfSkillTemplate = {
  id: string;
  labelEs: string;
  labelEn: string;
  /** Band this skill normally belongs to */
  level: SelfLevelId;
};

/** Ordered skill checklists the student can tick; level is derived from answers. */
export const SELF_SKILL_TEMPLATES: Record<ProgressDisciplineId, SelfSkillTemplate[]> = {
  esqui: [
    { id: "equilibrio-plano", labelEs: "Mantener el equilibrio en terreno plano", labelEn: "Balance on flat terrain", level: "debutante" },
    { id: "frenar-cuna", labelEs: "Frenar en cuña", labelEn: "Stop in a wedge", level: "debutante" },
    { id: "viraje-cuna", labelEs: "Hacer virajes en cuña en pista verde", labelEn: "Wedge turns on green runs", level: "debutante" },
    { id: "remontes-basicos", labelEs: "Usar telesillas con ayuda", labelEn: "Ride chairlifts with help", level: "debutante" },
    { id: "paralelo-elemental", labelEs: "Paralelo elemental en pista azul", labelEn: "Elementary parallel on blue runs", level: "intermedio" },
    { id: "control-velocidad", labelEs: "Controlar la velocidad en azul", labelEn: "Control speed on blue runs", level: "intermedio" },
    { id: "apoyo-baston", labelEs: "Usar el apoyo de bastón", labelEn: "Use a pole plant", level: "intermedio" },
    { id: "viraje-corto", labelEs: "Encadenar virajes cortos", labelEn: "Link short turns", level: "intermedio" },
    { id: "carving-rojo", labelEs: "Carving en pista roja", labelEn: "Carve on red runs", level: "avanzado" },
    { id: "nieve-dificil", labelEs: "Esquiar nieve dura o irregular", labelEn: "Ski hard or uneven snow", level: "avanzado" },
    { id: "fuera-pista-facil", labelEs: "Bajar fuera de pista fácil con guía", labelEn: "Easy off-piste with a guide", level: "avanzado" },
    { id: "pendiente-fuerte", labelEs: "Dominar pendientes fuertes con seguridad", labelEn: "Handle steep slopes confidently", level: "experto" },
    { id: "todo-tipo-nieve", labelEs: "Adaptarme a cualquier tipo de nieve", labelEn: "Adapt to any snow type", level: "experto" },
    { id: "lectura-terreno", labelEs: "Leer el terreno y elegir la línea", labelEn: "Read terrain and choose a line", level: "experto" },
  ],
  snowboard: [
    { id: "equilibrio-tabla", labelEs: "Equilibrio básico sobre la tabla", labelEn: "Basic balance on the board", level: "debutante" },
    { id: "diagonales", labelEs: "Diagonales en ambos cantos", labelEn: "Traverses on both edges", level: "debutante" },
    { id: "derrape", labelEs: "Derrape / hoja caída controlada", labelEn: "Controlled sideslip / falling leaf", level: "debutante" },
    { id: "viraje-guiado", labelEs: "Virajes guiados en pista verde", labelEn: "Guided turns on green runs", level: "debutante" },
    { id: "viraje-enlazado", labelEs: "Enlazar virajes en pista azul", labelEn: "Link turns on blue runs", level: "intermedio" },
    { id: "ambos-cantos", labelEs: "Cambiar de canto con fluidez", labelEn: "Change edges smoothly", level: "intermedio" },
    { id: "remontes-autonomo", labelEs: "Remontes con autonomía", labelEn: "Use lifts independently", level: "intermedio" },
    { id: "carving", labelEs: "Carving en pista azul/roja", labelEn: "Carve on blue/red runs", level: "avanzado" },
    { id: "switch-basico", labelEs: "Circular en switch básico", labelEn: "Ride basic switch", level: "avanzado" },
    { id: "nieve-variable", labelEs: "Gestionar nieve variable", labelEn: "Handle variable snow", level: "avanzado" },
    { id: "freeride-facil", labelEs: "Fuera de pista fácil con control", labelEn: "Easy freeride with control", level: "experto" },
    { id: "switch-avanzado", labelEs: "Switch fluido en pista roja", labelEn: "Fluid switch on red runs", level: "experto" },
    { id: "lineas-tecnicas", labelEs: "Elegir líneas técnicas con seguridad", labelEn: "Choose technical lines safely", level: "experto" },
  ],
  telemark: [
    { id: "posicion-base", labelEs: "Posición base telemark", labelEn: "Telemark base position", level: "debutante" },
    { id: "equilibrio-lunge", labelEs: "Equilibrio en posición adelantada", labelEn: "Balance in the lunge", level: "debutante" },
    { id: "cambio-pie", labelEs: "Cambio de pie en terreno suave", labelEn: "Lead change on easy terrain", level: "debutante" },
    { id: "viraje-basico", labelEs: "Viraje telemark básico", labelEn: "Basic telemark turn", level: "intermedio" },
    { id: "ritmo", labelEs: "Ritmo y cadencia en azul", labelEn: "Rhythm and cadence on blues", level: "intermedio" },
    { id: "control-cantos", labelEs: "Control de cantos", labelEn: "Edge control", level: "intermedio" },
    { id: "pista-roja", labelEs: "Telemark en pista roja", labelEn: "Telemark on red runs", level: "avanzado" },
    { id: "nieve-fria", labelEs: "Telemark en nieve dura", labelEn: "Telemark on hard snow", level: "avanzado" },
    { id: "fuera-pista", labelEs: "Telemark fuera de pista con guía", labelEn: "Off-piste telemark with a guide", level: "experto" },
    { id: "terreno-complejo", labelEs: "Terreno complejo con autonomía", labelEn: "Complex terrain independently", level: "experto" },
  ],
  "esqui-adaptado": [
    { id: "transferencia", labelEs: "Transferencias asistidas", labelEn: "Assisted transfers", level: "debutante" },
    { id: "equilibrio-silla", labelEs: "Equilibrio en silla / estabilos", labelEn: "Balance in sit-ski / outriggers", level: "debutante" },
    { id: "deslizamiento", labelEs: "Deslizamiento controlado en verde", labelEn: "Controlled gliding on greens", level: "debutante" },
    { id: "giros-asistidos", labelEs: "Giros con apoyo del instructor", labelEn: "Turns with instructor support", level: "intermedio" },
    { id: "remontes", labelEs: "Uso de remontes adaptados", labelEn: "Use adapted lifts", level: "intermedio" },
    { id: "giros-autonomos", labelEs: "Giros autónomos en azul", labelEn: "Independent turns on blues", level: "avanzado" },
    { id: "pista-roja", labelEs: "Pista roja con control", labelEn: "Red runs with control", level: "avanzado" },
    { id: "autonomia", labelEs: "Alta autonomía en estación", labelEn: "High independence at the resort", level: "experto" },
  ],
  freeride: [
    { id: "pista-roja-solida", labelEs: "Pista roja con soltura", labelEn: "Confident red-run skiing", level: "debutante" },
    { id: "nieve-no-pisada", labelEs: "Nieve no pisada junto a pista", labelEn: "Untracked snow next to the piste", level: "debutante" },
    { id: "lectura-basica", labelEs: "Lectura básica del terreno", labelEn: "Basic terrain reading", level: "intermedio" },
    { id: "viraje-flotado", labelEs: "Viraje flotado en polvo", labelEn: "Floating turn in powder", level: "intermedio" },
    { id: "tipos-nieve", labelEs: "Gestionar varios tipos de nieve", labelEn: "Handle several snow types", level: "avanzado" },
    { id: "seguridad-arva", labelEs: "Manejo de ARVA / pala / sonda", labelEn: "Use transceiver / shovel / probe", level: "avanzado" },
    { id: "lineas-expuestas", labelEs: "Líneas expuestas con criterio", labelEn: "Exposed lines with good judgment", level: "experto" },
    { id: "grupo-seguridad", labelEs: "Tomar decisiones de seguridad en grupo", labelEn: "Make group safety decisions", level: "experto" },
  ],
  freestyle: [
    { id: "switch-basico", labelEs: "Circular en switch básico", labelEn: "Basic switch riding", level: "debutante" },
    { id: "pequenos-saltos", labelEs: "Pequeños saltos de pista", labelEn: "Small on-piste jumps", level: "debutante" },
    { id: "despegue-recepcion", labelEs: "Postura de despegue y recepción", labelEn: "Take-off and landing stance", level: "intermedio" },
    { id: "cajas-planas", labelEs: "Cajas planas / 50-50", labelEn: "Flat boxes / 50-50", level: "intermedio" },
    { id: "saltos-park", labelEs: "Saltos de park con control", labelEn: "Park jumps with control", level: "avanzado" },
    { id: "rails", labelEs: "Rails básicos", labelEn: "Basic rails", level: "avanzado" },
    { id: "rotaciones", labelEs: "Rotaciones 180 / 360", labelEn: "180 / 360 rotations", level: "experto" },
    { id: "lineas-park", labelEs: "Líneas de park completas", labelEn: "Full park lines", level: "experto" },
  ],
};

const LEVEL_ORDER: SelfLevelId[] = ["debutante", "intermedio", "avanzado", "experto"];

export function selfSkillLabel(skill: SelfSkillTemplate, locale: string): string {
  return locale === "en" ? skill.labelEn : skill.labelEs;
}

export function skillsForDiscipline(discipline: ProgressDisciplineId): SelfSkillTemplate[] {
  return SELF_SKILL_TEMPLATES[discipline] ?? [];
}

export function skillsGroupedByLevel(
  discipline: ProgressDisciplineId,
): { level: SelfLevelId; levelNameEs: string; levelNameEn: string; skills: SelfSkillTemplate[] }[] {
  const skills = skillsForDiscipline(discipline);
  return LEVEL_ORDER.map((level) => {
    const meta = SELF_LEVELS.find((item) => item.id === level)!;
    return {
      level,
      levelNameEs: meta.nameEs,
      levelNameEn: meta.nameEn,
      skills: skills.filter((skill) => skill.level === level),
    };
  }).filter((group) => group.skills.length > 0);
}

/**
 * Derive a level from ticked skills.
 * Climbs level bands while coverage is ≥ half (min 1).
 * Empty lower bands are skipped so advanced riders aren't forced to Debutante.
 */
export function deriveSelfLevelFromSkills(
  discipline: ProgressDisciplineId,
  selectedIds: string[],
): SelfLevelId | null {
  const selected = new Set(selectedIds);
  if (selected.size === 0) return null;

  const groups = skillsGroupedByLevel(discipline);
  let derived: SelfLevelId | null = null;

  for (const group of groups) {
    const hits = group.skills.filter((skill) => selected.has(skill.id)).length;
    const needed = Math.max(1, Math.ceil(group.skills.length / 2));

    if (hits >= needed) {
      derived = group.level;
      continue;
    }

    if (hits >= 1) {
      derived = group.level;
      break;
    }

    if (derived) break;
  }

  return derived;
}

/** Highest level across disciplines the student assessed. */
export function deriveOverallSelfLevel(
  byDiscipline: Partial<Record<ProgressDisciplineId, string[]>>,
): SelfLevelId | null {
  let bestIndex = -1;
  for (const [discipline, ids] of Object.entries(byDiscipline) as [ProgressDisciplineId, string[]][]) {
    if (!ids?.length) continue;
    const level = deriveSelfLevelFromSkills(discipline, ids);
    if (!level) continue;
    bestIndex = Math.max(bestIndex, LEVEL_ORDER.indexOf(level));
  }
  return bestIndex >= 0 ? LEVEL_ORDER[bestIndex] : null;
}

export function isSelfSkillId(discipline: ProgressDisciplineId, id: string): boolean {
  return skillsForDiscipline(discipline).some((skill) => skill.id === id);
}
