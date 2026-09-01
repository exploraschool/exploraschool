import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { verifyLeadConfirmToken } from "@/lib/lead-confirm";
import { sendCustomerBookingConfirmation } from "@/lib/lead-emails";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { LeadStatus } from "@/lib/leads";

const ALLOWED_STATUSES = new Set<LeadStatus>(["confirmed", "cancelled"]);

async function updateLeadStatus(leadId: string, status: LeadStatus) {
  if (!isAdminConfigured()) {
    return { ok: false as const, error: "Firebase not configured", status: 503 };
  }

  const db = getAdminDb();
  if (!db) {
    return { ok: false as const, error: "Database unavailable", status: 503 };
  }

  const ref = db.collection("leads").doc(leadId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return { ok: false as const, error: "Lead not found", status: 404 };
  }

  const leadData = snapshot.data() ?? {};
  const currentStatus = String(leadData.status ?? "");
  if (currentStatus === status) {
    return {
      ok: true as const,
      already: true,
      data: leadData,
      emailSent: Boolean(leadData.confirmationEmailSentAt),
    };
  }

  await ref.update({
    status,
    confirmedAt: status === "confirmed" ? new Date().toISOString() : FieldValue.delete(),
    ...(status === "confirmed" ? { confirmationEmailSentAt: FieldValue.delete() } : {}),
  });

  const updated = { ...leadData, status };

  let emailSent = false;
  let emailError: string | undefined;

  if (status === "confirmed") {
    try {
      await sendCustomerBookingConfirmation(updated);
      emailSent = true;
      await ref.update({ confirmationEmailSentAt: new Date().toISOString() });
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Email send failed";
      console.error("[bookings/confirm] Customer email failed:", emailError);
    }
  }

  return { ok: true as const, already: false, data: updated, emailSent, emailError };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");
  const token = searchParams.get("token");
  const secret = process.env.LEAD_CONFIRM_SECRET;

  if (!leadId || !token || !secret) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!verifyLeadConfirmToken(leadId, token, secret)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const result = await updateLeadStatus(leadId, "confirmed");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const emailNote = result.emailSent
    ? "<p>El cliente recibirá un email de confirmación automáticamente.</p>"
    : `<p><strong>Atención:</strong> la reserva se marcó como confirmada pero el email al cliente no se envió. Revisa RESEND_API_KEY en Vercel.</p>${
        result.emailError
          ? `<p style="font-size:0.875rem;color:#666">${result.emailError.replace(/</g, "&lt;")}</p>`
          : ""
      }`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reserva confirmada</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; color: #0a1219; }
    h1 { color: #0a4d68; }
    a { color: #0a4d68; }
  </style>
</head>
<body>
  <h1>Reserva confirmada</h1>
  ${emailNote}
  <p><a href="/admin/leads">Volver al panel de leads</a></p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!leadId || !ALLOWED_STATUSES.has(status as LeadStatus)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const result = await updateLeadStatus(leadId, status as LeadStatus);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, already: result.already, emailSent: result.emailSent, emailError: result.emailError });
}
