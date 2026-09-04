import type { ProgressDisciplineId } from "@/data/progress-skills";

export const PROGRESS_REPORTS_COLLECTION = "progressReports";
export const PROGRESS_MEDIA_MAX = 3;

export type ProgressMediaKind = "image" | "video";

export type ProgressMedia = {
  id: string;
  storagePath: string;
  contentType: string;
  kind: ProgressMediaKind;
  fileName: string;
  createdAt: string;
};

export type ProgressReport = {
  id: string;
  leadId: string;
  itemIndex: number;
  studentUid: string;
  studentEmail: string;
  studentName: string;
  companionId?: string;
  instructorSlug: string;
  instructorName: string;
  discipline: ProgressDisciplineId;
  skills: Record<string, number>;
  rating: number;
  notes: string;
  recommendedPistaIds: string[];
  hours: number;
  media: ProgressMedia[];
  createdAt: string;
  updatedAt: string;
};

export function progressReportId(leadId: string, itemIndex: number): string {
  return `${leadId}_${itemIndex}`;
}

export function mediaKindFromContentType(contentType: string): ProgressMediaKind {
  return contentType.startsWith("video/") ? "video" : "image";
}

export function parseProgressReport(id: string, data: Record<string, unknown>): ProgressReport {
  const skillsRaw = data.skills && typeof data.skills === "object" ? (data.skills as Record<string, unknown>) : {};
  const skills: Record<string, number> = {};
  for (const [key, value] of Object.entries(skillsRaw)) {
    if (typeof value === "number" && value >= 1 && value <= 5) skills[key] = value;
  }

  const mediaRaw = Array.isArray(data.media) ? data.media : [];
  const media: ProgressMedia[] = mediaRaw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.storagePath !== "string") return [];
    return [
      {
        id: row.id,
        storagePath: row.storagePath,
        contentType: typeof row.contentType === "string" ? row.contentType : "application/octet-stream",
        kind: row.kind === "video" ? "video" : "image",
        fileName: typeof row.fileName === "string" ? row.fileName : row.id,
        createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
      },
    ];
  });

  const recommendedPistaIds = Array.isArray(data.recommendedPistaIds)
    ? data.recommendedPistaIds.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id,
    leadId: typeof data.leadId === "string" ? data.leadId : "",
    itemIndex: typeof data.itemIndex === "number" ? data.itemIndex : 0,
    studentUid: typeof data.studentUid === "string" ? data.studentUid : "",
    studentEmail: typeof data.studentEmail === "string" ? data.studentEmail : "",
    studentName: typeof data.studentName === "string" ? data.studentName : "",
    companionId: typeof data.companionId === "string" ? data.companionId : undefined,
    instructorSlug: typeof data.instructorSlug === "string" ? data.instructorSlug : "",
    instructorName: typeof data.instructorName === "string" ? data.instructorName : "",
    discipline: (typeof data.discipline === "string" ? data.discipline : "esqui") as ProgressDisciplineId,
    skills,
    rating: typeof data.rating === "number" ? Math.min(5, Math.max(1, data.rating)) : 3,
    notes: typeof data.notes === "string" ? data.notes : "",
    recommendedPistaIds,
    hours: typeof data.hours === "number" ? data.hours : 0,
    media,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

export const BADGE_DEFS = [
  { id: "first-report", hours: 0, labelEs: "Primera ficha", labelEn: "First report" },
  { id: "hours-5", hours: 5, labelEs: "5 horas en nieve", labelEn: "5 hours on snow" },
  { id: "hours-10", hours: 10, labelEs: "10 horas en nieve", labelEn: "10 hours on snow" },
  { id: "hours-20", hours: 20, labelEs: "20 horas en nieve", labelEn: "20 hours on snow" },
  { id: "five-stars", hours: 0, labelEs: "Valoración 5 estrellas", labelEn: "5-star rating" },
] as const;

export function earnedBadges(reports: ProgressReport[], locale: string): { id: string; label: string }[] {
  const hours = reports.reduce((sum, report) => sum + (report.hours || 0), 0);
  const hasReport = reports.length > 0;
  const hasFive = reports.some((report) => report.rating >= 5);
  const out: { id: string; label: string }[] = [];

  if (hasReport) {
    out.push({
      id: "first-report",
      label: locale === "en" ? "First report" : "Primera ficha",
    });
  }
  if (hours >= 5) out.push({ id: "hours-5", label: locale === "en" ? "5 hours on snow" : "5 horas en nieve" });
  if (hours >= 10) out.push({ id: "hours-10", label: locale === "en" ? "10 hours on snow" : "10 horas en nieve" });
  if (hours >= 20) out.push({ id: "hours-20", label: locale === "en" ? "20 hours on snow" : "20 horas en nieve" });
  if (hasFive) {
    out.push({
      id: "five-stars",
      label: locale === "en" ? "5-star rating" : "Valoración 5 estrellas",
    });
  }

  const disciplines = new Set(reports.map((report) => report.discipline));
  for (const discipline of disciplines) {
    out.push({
      id: `discipline-${discipline}`,
      label: locale === "en" ? `Progress in ${discipline}` : `Progreso en ${discipline}`,
    });
  }

  return out;
}

export function totalProgressHours(reports: ProgressReport[]): number {
  return reports.reduce((sum, report) => sum + (Number(report.hours) || 0), 0);
}
