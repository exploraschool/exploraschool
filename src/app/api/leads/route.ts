import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { upsertMarketingContact } from "@/lib/marketing-contacts";
import { isBookingTooLate, partitionByBookingCutoff } from "@/lib/booking-cutoff";
import type { LeadStatus, LeadType, StoredBookingItem } from "@/lib/leads";
import { collectInstructorSlugs, isBookingLead } from "@/lib/leads";
import { normalizeEmail } from "@/lib/link-bookings";
import { getStudentSession } from "@/lib/student-auth";
import { upsertStudentProfile } from "@/lib/student-user-store";

const bookingItemSchema = z.object({
  productId: z.string().min(1).max(80),
  date: z.string().min(8).max(12),
  timeSlotId: z.string().min(1).max(40),
  timeSlotLabel: z.string().min(1).max(80),
  participants: z.number().int().min(1).max(20),
  discipline: z.string().min(1).max(40),
  modality: z.string().max(40).optional(),
  instructorSlug: z.string().max(80).optional(),
  instructorName: z.string().max(120).optional(),
  unitPrice: z.number().min(0),
  lineTotal: z.number().min(0),
  listUnitPrice: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const leadSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(30).optional(),
    message: z.string().max(15000).optional().default(""),
    privacy: z.literal(true),
    website: z.string().max(0).optional(),
    locale: z.string().optional(),
    source: z.string().max(50).optional(),
    bookingItems: z.array(bookingItemSchema).max(20).optional(),
    estimatedTotal: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const isBooking = data.source === "booking-cart";
    if (isBooking) {
      if (!data.bookingItems?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Booking items required",
          path: ["bookingItems"],
        });
        return;
      }
      const now = new Date();
      data.bookingItems.forEach((item, index) => {
        if (isBookingTooLate(item.date, item.timeSlotId, now)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Booking cutoff: less than 1 hour before class start",
            path: ["bookingItems", index],
          });
        }
      });
      return;
    }
    if (data.message.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 10,
        type: "string",
        inclusive: true,
        exact: false,
        path: ["message"],
      });
    }
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      const tooLate = parsed.error.issues.some((issue) =>
        String(issue.message).includes("Booking cutoff"),
      );
      return NextResponse.json(
        {
          error: tooLate ? "booking_cutoff" : "Invalid data",
          ...(tooLate ? { code: "booking_cutoff" as const } : {}),
        },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const isBooking = parsed.data.source === "booking-cart";
    const type: LeadType = isBooking ? "booking" : "contact";
    const status: LeadStatus = isBooking ? "pending" : "received";

    const student = await getStudentSession();
    let bookingItems = isBooking ? (parsed.data.bookingItems as StoredBookingItem[]) : undefined;
    if (bookingItems) {
      const { bookable, tooLate } = partitionByBookingCutoff(bookingItems);
      if (tooLate.length > 0) {
        return NextResponse.json({ error: "booking_cutoff", code: "booking_cutoff" }, { status: 400 });
      }
      bookingItems = bookable;
    }

    const submittedEmail = parsed.data.email;
    const linkedStudent =
      student && normalizeEmail(student.email) === normalizeEmail(submittedEmail) ? student : null;

    if (linkedStudent) {
      try {
        await upsertStudentProfile(linkedStudent.uid, {
          email: linkedStudent.email,
          displayName: parsed.data.name.trim() || linkedStudent.name,
          phone: (parsed.data.phone ?? "").trim(),
        });
      } catch (profileError) {
        console.error("[leads] Student profile phone sync failed:", profileError);
      }
    }

    const lead = {
      type,
      status,
      name: parsed.data.name,
      email: submittedEmail,
      emailLower: normalizeEmail(submittedEmail),
      phone: parsed.data.phone ?? "",
      message: parsed.data.message,
      locale: parsed.data.locale ?? "es",
      source: parsed.data.source ?? "contact-form",
      createdAt: new Date().toISOString(),
      privacyAccepted: true as const,
      ...(linkedStudent ? { studentUid: linkedStudent.uid } : {}),
      ...(isBooking && bookingItems
        ? {
            bookingItems,
            estimatedTotal: parsed.data.estimatedTotal ?? 0,
            instructorSlugs: collectInstructorSlugs(bookingItems),
          }
        : {}),
    };

    if (isAdminConfigured()) {
      const db = getAdminDb();
      if (db) {
        const doc = await db.collection("leads").add(lead);
        // Team email is sent by Firebase onLeadCreated — do not send it here too.
        try {
          await upsertMarketingContact(db, {
            email: lead.email,
            name: lead.name,
            phone: lead.phone,
            locale: lead.locale,
            source: isBookingLead(lead) ? "booking" : "contact",
            leadId: doc.id,
            status: lead.status,
            privacyAccepted: true,
          });
        } catch (marketingError) {
          console.error("[leads] Marketing contact upsert failed:", marketingError);
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
