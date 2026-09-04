import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { marketingContactDocId } from "@/lib/marketing-contacts";

export const runtime = "nodejs";

type Params = { params: Promise<{ email: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { email: raw } = await params;
  const email = decodeURIComponent(raw || "").trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    const ref = db.collection("marketingContacts").doc(marketingContactDocId(email));
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/marketing] delete failed:", error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
