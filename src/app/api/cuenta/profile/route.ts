import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deriveOverallSelfLevel,
  isSelfSkillId,
} from "@/data/self-assessment-skills";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile, upsertStudentProfile } from "@/lib/student-user-store";
import { isOnboardingComplete } from "@/lib/student-users";
import { equipmentSchema } from "@/lib/student-equipment";

export const runtime = "nodejs";

const DISCIPLINE_IDS = [
  "esqui",
  "snowboard",
  "telemark",
  "esqui-adaptado",
  "freeride",
  "freestyle",
] as const;

const companionSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  relation: z.enum(["child", "partner", "friend"]),
  age: z.number().int().min(0).max(120).optional(),
});

const bodySchema = z.object({
  locale: z.enum(["es", "en"]).optional(),
  hasTakenClassesBefore: z.boolean().nullable().optional(),
  onboardingCompletedAt: z.string().nullable().optional(),
  completeOnboarding: z.boolean().optional(),
  disciplines: z.array(z.enum(DISCIPLINE_IDS)).max(6).optional(),
  equipment: equipmentSchema.nullable().optional(),
  companions: z.array(companionSchema).max(12).optional(),
  selfSkills: z.record(z.string(), z.array(z.string().min(1).max(80)).max(30)).optional(),
  selfLevel: z.enum(["debutante", "intermedio", "avanzado", "experto"]).nullable().optional(),
});

function sanitizeSelfSkills(
  raw: Record<string, string[]> | undefined,
): Partial<Record<ProgressDisciplineId, string[]>> | undefined {
  if (!raw) return undefined;
  const next: Partial<Record<ProgressDisciplineId, string[]>> = {};
  for (const [key, ids] of Object.entries(raw)) {
    if (!(DISCIPLINE_IDS as readonly string[]).includes(key)) continue;
    const discipline = key as ProgressDisciplineId;
    next[discipline] = ids.filter((id) => isSelfSkillId(discipline, id));
  }
  return next;
}

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const profile = await getStudentProfile(session.uid);
  return NextResponse.json({
    profile,
    onboardingComplete: profile ? isOnboardingComplete(profile) : false,
  });
}

export async function PATCH(request: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const completeOnboarding = parsed.data.completeOnboarding === true;
  const selfSkills = sanitizeSelfSkills(parsed.data.selfSkills);
  const selfLevel =
    selfSkills !== undefined ? deriveOverallSelfLevel(selfSkills) : parsed.data.selfLevel;

  const profile = await upsertStudentProfile(session.uid, {
    email: session.email,
    displayName: session.name,
    photoURL: session.picture,
    locale: parsed.data.locale,
    hasTakenClassesBefore: parsed.data.hasTakenClassesBefore,
    onboardingCompletedAt: completeOnboarding
      ? new Date().toISOString()
      : parsed.data.onboardingCompletedAt,
    disciplines: parsed.data.disciplines,
    equipment: parsed.data.equipment,
    companions: parsed.data.companions,
    selfSkills,
    selfLevel,
  });

  return NextResponse.json({
    profile,
    onboardingComplete: isOnboardingComplete(profile),
  });
}
