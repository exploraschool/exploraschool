import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  marketingContactsToCsv,
  type MarketingContact,
} from "@/lib/marketing-contacts";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source"); // booking | contact | all
  const bookingsOnly = source === "booking";

  const snapshot = await db.collection("marketingContacts").orderBy("lastSeenAt", "desc").limit(2000).get();
  let contacts = snapshot.docs.map((doc) => doc.data() as MarketingContact);

  if (bookingsOnly) {
    contacts = contacts.filter((c) => (c.sources ?? []).includes("booking") || (c.bookingCount ?? 0) > 0);
  } else if (source === "contact") {
    contacts = contacts.filter((c) => (c.sources ?? []).includes("contact"));
  }

  const csv = marketingContactsToCsv(contacts);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = bookingsOnly
    ? `explora-emails-reservas-${stamp}.csv`
    : `explora-emails-${stamp}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
