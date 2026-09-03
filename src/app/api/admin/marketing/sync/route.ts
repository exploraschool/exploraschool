import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { isBookingLead } from "@/lib/leads";
import { upsertMarketingContact } from "@/lib/marketing-contacts";

/** Backfill marketingContacts from existing leads. */
export async function POST() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const snapshot = await db.collection("leads").orderBy("createdAt", "asc").limit(1000).get();
  let processed = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const email = String(data.email ?? "").trim();
    if (!email) {
      skipped += 1;
      continue;
    }

    await upsertMarketingContact(db, {
      email,
      name: String(data.name ?? ""),
      phone: String(data.phone ?? ""),
      locale: String(data.locale ?? "es"),
      source: isBookingLead(data) ? "booking" : "contact",
      leadId: doc.id,
      status: String(data.status ?? ""),
      privacyAccepted: data.privacyAccepted !== false,
    });
    processed += 1;
  }

  return NextResponse.json({
    ok: true,
    processed,
    skipped,
    totalLeads: snapshot.size,
  });
}
