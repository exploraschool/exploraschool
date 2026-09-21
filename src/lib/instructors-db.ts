import type { DisciplineId } from "@/data/disciplines";
import {
  DEFAULT_INSTRUCTOR_PHOTO,
  instructors as staticInstructors,
  resolveInstructorPhoto,
  type Instructor,
} from "@/data/instructors";
import { getAdminDb } from "@/lib/firebase/admin";

export const INSTRUCTORS_COLLECTION = "instructors";

export type StoredInstructor = Instructor;

function asInstructor(id: string, data: Record<string, unknown>): StoredInstructor {
  const disciplines = Array.isArray(data.disciplines)
    ? data.disciplines.filter((item): item is DisciplineId => typeof item === "string")
    : [];
  const languages = Array.isArray(data.languages)
    ? data.languages.filter((item): item is "es" | "en" => item === "es" || item === "en")
    : (["es"] as ("es" | "en")[]);

  return {
    slug: typeof data.slug === "string" && data.slug ? data.slug : id,
    name: typeof data.name === "string" ? data.name : id,
    disciplines,
    bioEs: typeof data.bioEs === "string" ? data.bioEs : "",
    bioEn: typeof data.bioEn === "string" ? data.bioEn : "",
    languages: languages.length ? languages : ["es"],
    active: data.active !== false,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 99,
    photo: resolveInstructorPhoto(typeof data.photo === "string" ? data.photo : DEFAULT_INSTRUCTOR_PHOTO),
  };
}

function catalogRecord(instructor: Instructor): Record<string, unknown> {
  return {
    slug: instructor.slug,
    name: instructor.name,
    disciplines: instructor.disciplines,
    bioEs: instructor.bioEs,
    bioEn: instructor.bioEn,
    languages: instructor.languages,
    active: instructor.active,
    sortOrder: instructor.sortOrder,
    photo: instructor.photo,
  };
}

function mergeInstructorLists(fromDb: Map<string, StoredInstructor>): StoredInstructor[] {
  const merged: StoredInstructor[] = [];
  const seen = new Set<string>();

  for (const catalog of staticInstructors) {
    merged.push(fromDb.get(catalog.slug) ?? { ...catalog });
    seen.add(catalog.slug);
  }

  for (const stored of fromDb.values()) {
    if (!seen.has(stored.slug)) merged.push(stored);
  }

  return merged.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/**
 * Re-creates catalog instructors missing from Firestore without touching
 * existing docs (so uploaded photos / admin edits stay in place).
 */
async function restoreMissingCatalogInstructors(
  db: NonNullable<ReturnType<typeof getAdminDb>>,
  fromDb: Map<string, StoredInstructor>,
): Promise<void> {
  const missing = staticInstructors.filter((item) => !fromDb.has(item.slug));
  if (missing.length === 0) return;

  const batch = db.batch();
  for (const instructor of missing) {
    batch.set(db.collection(INSTRUCTORS_COLLECTION).doc(instructor.slug), catalogRecord(instructor));
    fromDb.set(instructor.slug, { ...instructor });
  }
  await batch.commit();
}

export async function listInstructorsFromDb(): Promise<StoredInstructor[]> {
  const db = getAdminDb();
  if (!db) return staticInstructors.map((item) => ({ ...item }));

  try {
    const snap = await db.collection(INSTRUCTORS_COLLECTION).get();
    const fromDb = new Map<string, StoredInstructor>();
    for (const doc of snap.docs) {
      const instructor = asInstructor(doc.id, doc.data() as Record<string, unknown>);
      fromDb.set(instructor.slug, instructor);
    }

    try {
      await restoreMissingCatalogInstructors(db, fromDb);
    } catch (error) {
      console.error("[instructors-db] catalog restore failed:", error);
    }
    return mergeInstructorLists(fromDb);
  } catch (error) {
    console.error("[instructors-db] list failed:", error);
    return staticInstructors.map((item) => ({ ...item }));
  }
}

export async function listActiveInstructorsFromDb(): Promise<StoredInstructor[]> {
  return (await listInstructorsFromDb()).filter((item) => item.active);
}

export async function getInstructorFromDb(slug: string): Promise<StoredInstructor | null> {
  const all = await listInstructorsFromDb();
  return all.find((item) => item.slug === slug) ?? null;
}

export function slugifyInstructorName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
