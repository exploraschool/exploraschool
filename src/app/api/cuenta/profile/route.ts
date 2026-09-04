import { NextResponse } from "next/server";
import { z } from "zod";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile, upsertStudentProfile } from "@/lib/student-user-store";
import { isOnboardingComplete } from "@/lib/student-users";

export const runtime = "nodejs";

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
  disciplines: z
    .array(z.enum(["esqui", "snowboard", "telemark", "esqui-adaptado", "freeride", "freestyle"]))
    .max(6)
    .optional(),
  equipment: z
    .object({
      source: z.enum(["own", "rental"]),
      bootSize: z.string().max(12),
      heightCm: z.number().min(50).max(250).nullable(),
      weightKg: z.number().min(15).max(250).nullable(),
    })
    .nullable()
    .optional(),
  companions: z.array(companionSchema).max(12).optional(),
  selfLevel: z.enum(["debutante", "intermedio", "avanzado", "experto"]).nullable().optional(),
});

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
    selfLevel: parsed.data.selfLevel,
  });

  return NextResponse.json({
    profile,
    onboardingComplete: isOnboardingComplete(profile),
  });
}
