import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildBookingActionResultHtml } from "@/lib/booking-action-result";
import { updateBookingLeadStatus } from "@/lib/booking-status";
import { verifyStoredOrHmacLeadToken } from "@/lib/lead-confirm";
import type { LeadStatus } from "@/lib/leads";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

const ALLOWED_STATUSES = new Set<LeadStatus>(["confirmed", "cancelled"]);

function resultHtml(
  kind: "confirm" | "cancel",
  emailSent: boolean,
  emailError?: string,
  already?: boolean,
) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL).replace(/\/$/, "");
  return buildBookingActionResultHtml({
    kind,
    already,
    emailSent,
    emailError,
    siteUrl,
  });
}

function errorHtml(message: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL).replace(/\/$/, "");
  return buildBookingActionResultHtml({
    kind: "error",
    message,
    siteUrl,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");
  const token = searchParams.get("token");
  const secret = process.env.LEAD_CONFIRM_SECRET;

  if (!leadId || !token) {
    return new NextResponse(errorHtml("El enlace de confirmación no es válido (faltan datos)."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!isAdminConfigured()) {
    return new NextResponse(errorHtml("El sistema no está disponible ahora mismo. Confirma desde el panel de reservas."), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const db = getAdminDb();
  if (!db) {
    return new NextResponse(errorHtml("Base de datos no disponible. Confirma desde el panel de reservas."), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const snapshot = await db.collection("leads").doc(leadId).get();
  if (!snapshot.exists) {
    return new NextResponse(errorHtml("No encontramos esta reserva. Puede haberse eliminado."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const leadData = snapshot.data() ?? {};
  const valid = verifyStoredOrHmacLeadToken({
    leadId,
    token,
    action: "confirm",
    storedToken: typeof leadData.confirmToken === "string" ? leadData.confirmToken : null,
    secret,
  });

  if (!valid) {
    return new NextResponse(
      errorHtml(
        "El enlace de confirmación no es válido o ha caducado. Abre el panel de reservas y confirma desde ahí.",
      ),
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const result = await updateBookingLeadStatus(leadId, "confirmed");
  if (!result.ok) {
    return new NextResponse(errorHtml(result.error), {
      status: result.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(resultHtml("confirm", result.emailSent, result.emailError, result.already), {
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

  const result = await updateBookingLeadStatus(
    leadId,
    status as "confirmed" | "cancelled",
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    already: result.already,
    emailSent: result.emailSent,
    emailError: result.emailError,
  });
}
