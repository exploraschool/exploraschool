import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  INSTRUCTORS_COLLECTION,
  listInstructorsFromDb,
  slugifyInstructorName,
} from "@/lib/instructors-db";
import type { DisciplineId } from "@/data/disciplines";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const instructorSchema = z.object({
  slug: z.string().min(1).max(80).optional(),
  name: z.string().min(2).max(80),
  bioEs: z.string().max(2000).optional().default(""),
  bioEn: z.string().max(2000).optional().default(""),
  disciplines: z.array(z.string()).min(1).max(12),
  languages: z.array(z.enum(["es", "en"])).min(1).optional().default(["es"]),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(999).optional().default(99),
  photo: z.string().max(500).optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const instructors = await listInstructorsFromDb();
  return NextResponse.json({ instructors });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return uploadInstructorPhoto(request);
  }

  const parsed = instructorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const existing = await listInstructorsFromDb();
  let slug = parsed.data.slug?.trim() || slugifyInstructorName(parsed.data.name);
  if (!slug) slug = `instructor-${Date.now()}`;
  if (existing.some((item) => item.slug === slug)) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const record = {
    slug,
    name: parsed.data.name,
    bioEs: parsed.data.bioEs,
    bioEn: parsed.data.bioEn,
    disciplines: parsed.data.disciplines as DisciplineId[],
    languages: parsed.data.languages,
    active: parsed.data.active,
    sortOrder: parsed.data.sortOrder,
    photo: parsed.data.photo || `/images/instructors/${slug}.jpg`,
  };

  await db.collection(INSTRUCTORS_COLLECTION).doc(slug).set(record);
  return NextResponse.json({ ok: true, instructor: record });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const parsed = instructorSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const ref = db.collection(INSTRUCTORS_COLLECTION).doc(slug);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { slug: _ignored, ...updates } = parsed.data;
  await ref.set({ ...updates, slug }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  await db.collection(INSTRUCTORS_COLLECTION).doc(slug).delete();
  return NextResponse.json({ ok: true });
}

async function uploadInstructorPhoto(request: Request) {
  const form = await request.formData();
  const slug = String(form.get("slug") || "").trim();
  const file = form.get("file");
  if (!slug || !(file instanceof File)) {
    return NextResponse.json({ error: "invalid_upload" }, { status: 400 });
  }
  const type = file.type.toLowerCase();
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const bucket = getAdminBucket();
  const db = getAdminDb();
  if (!bucket || !db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const storagePath = `public/instructors/${slug}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await bucket.file(storagePath).save(buffer, {
    contentType: type === "image/jpg" ? "image/jpeg" : type,
    resumable: false,
    public: true,
    metadata: { cacheControl: "public,max-age=31536000" },
  });

  const photo = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  await db.collection(INSTRUCTORS_COLLECTION).doc(slug).set({ photo }, { merge: true });
  return NextResponse.json({ ok: true, photo });
}
