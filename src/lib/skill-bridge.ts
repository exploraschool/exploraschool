import type { ProgressDisciplineId } from "@/data/progress-skills";
import { progressSkillLabel, PROGRESS_SKILLS } from "@/data/progress-skills";
import type { ProgressReport } from "@/lib/progress-reports";

/**
 * Self-assessment skill ids that map to instructor progress skill ids
 * (same id or explicit alias).
 */
const SELF_TO_PROGRESS: Partial<Record<ProgressDisciplineId, Record<string, string>>> = {
  esqui: {
    "viraje-cuna": "viraje-cuna",
    "paralelo-elemental": "paralelo-elemental",
    "control-velocidad": "control-velocidad",
    "apoyo-baston": "apoyo-baston",
    "carving-rojo": "carving",
    "lectura-terreno": "lectura-terreno",
  },
  snowboard: {
    diagonales: "diagonales",
    derrape: "derrape",
    "viraje-guiado": "viraje-guiado",
    carving: "carving",
    "switch-basico": "switch",
  },
  telemark: {
    "posicion-base": "posicion-base",
    "viraje-telemark": "viraje-telemark",
  },
  freeride: {
    "lectura-terreno": "lectura-terreno",
  },
  freestyle: {},
  "esqui-adaptado": {
    remontes: "remontes",
  },
};

export type SkillTimelinePoint = {
  date: string;
  rating: number;
  reportId: string;
};

export type SkillTimelineRow = {
  skillId: string;
  label: string;
  points: SkillTimelinePoint[];
  latest: number | null;
  previous: number | null;
  delta: number | null;
};

export function mapSelfSkillToProgress(
  discipline: ProgressDisciplineId,
  selfSkillId: string,
): string | null {
  return SELF_TO_PROGRESS[discipline]?.[selfSkillId] ?? null;
}

export function buildSkillTimeline(
  reports: ProgressReport[],
  discipline: ProgressDisciplineId,
  locale = "es",
): SkillTimelineRow[] {
  const forDiscipline = reports
    .filter((report) => report.discipline === discipline)
    .slice()
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

  const bySkill = new Map<string, SkillTimelinePoint[]>();
  for (const report of forDiscipline) {
    for (const [skillId, rating] of Object.entries(report.skills)) {
      const list = bySkill.get(skillId) ?? [];
      list.push({
        date: report.updatedAt.slice(0, 10),
        rating,
        reportId: report.id,
      });
      bySkill.set(skillId, list);
    }
  }

  const catalog = PROGRESS_SKILLS[discipline] ?? [];
  const rows: SkillTimelineRow[] = [];

  for (const skill of catalog) {
    const points = bySkill.get(skill.id) ?? [];
    if (points.length === 0) continue;
    const latest = points[points.length - 1]?.rating ?? null;
    const previous = points.length >= 2 ? (points[points.length - 2]?.rating ?? null) : null;
    rows.push({
      skillId: skill.id,
      label: progressSkillLabel(discipline, skill.id, locale),
      points,
      latest,
      previous,
      delta: latest != null && previous != null ? latest - previous : null,
    });
  }

  // Include any rated skills not in catalog (legacy ids)
  for (const [skillId, points] of bySkill) {
    if (rows.some((row) => row.skillId === skillId)) continue;
    const latest = points[points.length - 1]?.rating ?? null;
    const previous = points.length >= 2 ? (points[points.length - 2]?.rating ?? null) : null;
    rows.push({
      skillId,
      label: skillId,
      points,
      latest,
      previous,
      delta: latest != null && previous != null ? latest - previous : null,
    });
  }

  return rows.sort((a, b) => (b.latest ?? 0) - (a.latest ?? 0));
}
