import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { sendTeamLeadNotification } from "@/lib/lead-emails";
import type { LeadStatus, LeadType, StoredBookingItem } from "@/lib/leads";

const bookingItemSchema = z.object({
  productId: z.string().min(1).max(80),
  date: z.string().min(8).max(12),
  timeSlotId: z.string().min(1).max(40),
  timeSlotLabel: z.string().min(1).max(80),
  participants: z.number().int().min(1).max(20),
  discipline: z.string().max(40).optional(),
  modality: z.string().max(40).optional(),
  instructorSlug: z.string().max(80).optional(),
  instructorName: z.string().max(120).optional(),
  unitPrice: z.number().min(0),
  lineTotal: z.number().min(0),
  listUnitPrice: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().min(10).max(15000),
  privacy: z.literal(true),
  website: z.string().max(0).optional(),
  locale: z.string().optional(),
  source: z.string().max(50).optional(),
  bookingItems: z.array(bookingItemSchema).max(20).optional(),
  estimatedTotal: z.number().min(0).optional(),
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

    const isBooking = parsed.data.source === "booking-cart";
    const type: LeadType = isBooking ? "booking" : "contact";
    const status: LeadStatus = isBooking ? "pending" : "received";

    const lead = {
      type,
      status,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      message: parsed.data.message,
      locale: parsed.data.locale ?? "es",
      source: parsed.data.source ?? "contact-form",
      createdAt: new Date().toISOString(),
      ...(isBooking && parsed.data.bookingItems
        ? {
            bookingItems: parsed.data.bookingItems as StoredBookingItem[],
            estimatedTotal: parsed.data.estimatedTotal ?? 0,
          }
        : {}),
    };

    if (isAdminConfigured()) {
      const db = getAdminDb();
      if (db) {
        const doc = await db.collection("leads").add(lead);
        try {
          await sendTeamLeadNotification(doc.id, lead);
        } catch (emailError) {
          console.error("[leads] Team email failed:", emailError);
        }
        return NextResponse.json({ ok: true, id: doc.id });
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
