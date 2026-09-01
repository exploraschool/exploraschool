import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().min(10).max(5000),
  privacy: z.literal(true),
  website: z.string().max(0).optional(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const lead = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      message: parsed.data.message,
      locale: parsed.data.locale ?? "es",
      source: "contact-form",
      createdAt: new Date().toISOString(),
    };

    if (isAdminConfigured()) {
      const db = getAdminDb();
      if (db) {
        await db.collection("leads").add(lead);
      }
    } else {
      console.info("[leads] Firebase not configured — lead logged:", lead.email);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[leads] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
