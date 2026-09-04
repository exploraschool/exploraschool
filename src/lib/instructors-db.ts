import type { DisciplineId } from "@/data/disciplines";
import { instructors as staticInstructors, type Instructor } from "@/data/instructors";
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
    photo: typeof data.photo === "string" ? data.photo : `/images/instructors/${id}.jpg`,
  };
}

export async function listInstructorsFromDb(): Promise<StoredInstructor[]> {
  const db = getAdminDb();
  if (!db) return staticInstructors.map((item) => ({ ...item }));

  try {
    const snap = await db.collection(INSTRUCTORS_COLLECTION).get();
    if (snap.empty) return staticInstructors.map((item) => ({ ...item }));
    return snap.docs
      .map((doc) => asInstructor(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
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
