import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deriveOverallSelfLevel,
  isSelfSkillId,
} from "@/data/self-assessment-skills";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  adminUpsertStudentProfile,
  deleteStudentProfile,
  getStudentProfile,
} from "@/lib/student-user-store";
import {
  parseProgressReport,
  PROGRESS_REPORTS_COLLECTION,
} from "@/lib/progress-reports";
import type { StoredLead } from "@/lib/leads";
import { listStudentMediaForUid } from "@/lib/student-media";
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

const patchSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  disciplines: z.array(z.enum(DISCIPLINE_IDS)).max(6).optional(),
  equipment: equipmentSchema.nullable().optional(),
  companions: z.array(companionSchema).max(12).optional(),
  selfSkills: z.record(z.string(), z.array(z.string().min(1).max(80)).max(30)).optional(),
  selfLevel: z.enum(["debutante", "intermedio", "avanzado", "experto"]).nullable().optional(),
  staffTips: z.string().max(8000).optional(),
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

type RouteContext = { params: Promise<{ uid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  const profile = await getStudentProfile(uid);
  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const db = getAdminDb();
  const reports: ReturnType<typeof parseProgressReport>[] = [];
  const bookings: {
    leadId: string;
    itemIndex: number;
    status: string;
    productTitle: string;
    date: string;
    timeSlotId: string;
    discipline: string;
    instructorSlug: string;
    instructorName: string;
  }[] = [];
  if (db) {
    const reportSnap = await db
      .collection(PROGRESS_REPORTS_COLLECTION)
      .where("studentUid", "==", uid)
      .get()
      .catch(async () => {
        const all = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
        return {
          docs: all.docs.filter((doc) => {
            const data = doc.data() as Record<string, unknown>;
            return data.studentUid === uid || data.studentEmail === profile.email;
          }),
        };
      });

    for (const doc of reportSnap.docs) {
      reports.push(parseProgressReport(doc.id, doc.data() as Record<string, unknown>));
    }
    reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const leadSnap = await db.collection("leads").where("studentUid", "==", uid).get().catch(async () => {
      const all = await db.collection("leads").get();
      return {
        docs: all.docs.filter((doc) => {
          const data = doc.data() as Record<string, unknown>;
          return data.studentUid === uid || String(data.email || "").toLowerCase() === profile.email.toLowerCase();
        }),
      };
    });

    for (const doc of leadSnap.docs) {
      const lead = { id: doc.id, ...(doc.data() as StoredLead) };
      const items = lead.bookingItems ?? [];
      items.forEach((item, itemIndex) => {
        bookings.push({
          leadId: lead.id,
          itemIndex,
          status: lead.status,
          productTitle: item.productId,
          date: item.date,
          timeSlotId: item.timeSlotId,
          discipline: item.discipline,
          instructorSlug: item.assignedInstructorSlug || item.instructorSlug || "",
          instructorName: item.assignedInstructorName || item.instructorName || "",
        });
      });
    }
    bookings.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  const media = await listStudentMediaForUid(uid);

  return NextResponse.json({ profile, reports, bookings, media });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const selfSkills = sanitizeSelfSkills(parsed.data.selfSkills);
  const selfLevel =
    selfSkills !== undefined ? deriveOverallSelfLevel(selfSkills) : parsed.data.selfLevel;

  const profile = await adminUpsertStudentProfile(uid, {
    displayName: parsed.data.displayName,
    disciplines: parsed.data.disciplines,
    equipment: parsed.data.equipment,
    companions: parsed.data.companions,
    selfSkills,
    selfLevel,
    staffTips: parsed.data.staffTips,
  });

  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { uid } = await context.params;
  try {
    const ok = await deleteStudentProfile(uid);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/students] delete failed:", error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
