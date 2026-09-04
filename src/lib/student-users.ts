import type {
  CompanionRelation,
  EquipmentSource,
  SelfLevelId,
} from "@/data/student-account";
import type { ProgressDisciplineId } from "@/data/progress-skills";

export const USERS_COLLECTION = "users";

export type StudentCompanion = {
  id: string;
  name: string;
  relation: CompanionRelation;
  age?: number;
};

export type StudentEquipment = {
  source: EquipmentSource;
  bootSize: string;
  heightCm: number | null;
  weightKg: number | null;
};

export type StudentProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  locale: string;
  hasTakenClassesBefore: boolean | null;
  onboardingCompletedAt: string | null;
  disciplines: ProgressDisciplineId[];
  equipment: StudentEquipment | null;
  companions: StudentCompanion[];
  selfLevel: SelfLevelId | null;
  createdAt: string;
  updatedAt: string;
};

export function isOnboardingComplete(profile: Pick<StudentProfile, "onboardingCompletedAt">): boolean {
  return Boolean(profile.onboardingCompletedAt);
}

export function profileNeedsWizard(profile: StudentProfile): boolean {
  return !isOnboardingComplete(profile);
}

export function parseStudentProfile(uid: string, data: Record<string, unknown>): StudentProfile {
  const equipmentRaw = data.equipment;
  let equipment: StudentEquipment | null = null;
  if (equipmentRaw && typeof equipmentRaw === "object") {
    const row = equipmentRaw as Record<string, unknown>;
    equipment = {
      source: row.source === "rental" ? "rental" : "own",
      bootSize: typeof row.bootSize === "string" ? row.bootSize : "",
      heightCm: typeof row.heightCm === "number" ? row.heightCm : null,
      weightKg: typeof row.weightKg === "number" ? row.weightKg : null,
    };
  }

  const companionsRaw = Array.isArray(data.companions) ? data.companions : [];
  const companions: StudentCompanion[] = companionsRaw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const id = typeof row.id === "string" ? row.id : "";
    if (!name || !id) return [];
    const relation: CompanionRelation =
      row.relation === "partner" || row.relation === "friend" ? row.relation : "child";
    return [
      {
        id,
        name,
        relation,
        age: typeof row.age === "number" ? row.age : undefined,
      },
    ];
  });

  const disciplines = Array.isArray(data.disciplines)
    ? data.disciplines.filter((item): item is ProgressDisciplineId => typeof item === "string")
    : [];

  const selfLevel =
    data.selfLevel === "debutante" ||
    data.selfLevel === "intermedio" ||
    data.selfLevel === "avanzado" ||
    data.selfLevel === "experto"
      ? data.selfLevel
      : null;

  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : "",
    locale: typeof data.locale === "string" ? data.locale : "es",
    hasTakenClassesBefore:
      data.hasTakenClassesBefore === true ? true : data.hasTakenClassesBefore === false ? false : null,
    onboardingCompletedAt:
      typeof data.onboardingCompletedAt === "string" ? data.onboardingCompletedAt : null,
    disciplines,
    equipment,
    companions,
    selfLevel,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}
