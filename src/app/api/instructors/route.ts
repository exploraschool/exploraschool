import { NextResponse } from "next/server";
import { listActiveInstructorsFromDb } from "@/lib/instructors-db";

export const runtime = "nodejs";

export async function GET() {
  const instructors = await listActiveInstructorsFromDb();
  return NextResponse.json({
    instructors: instructors.map((item) => ({
      slug: item.slug,
      name: item.name,
      disciplines: item.disciplines,
      photo: item.photo,
      bioEs: item.bioEs,
      bioEn: item.bioEn,
      languages: item.languages,
      active: item.active,
      sortOrder: item.sortOrder,
    })),
  });
}
