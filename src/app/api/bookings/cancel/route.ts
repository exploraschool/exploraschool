import { NextResponse } from "next/server";
import { buildBookingActionResultHtml } from "@/lib/booking-action-result";
import { updateBookingLeadStatus } from "@/lib/booking-status";
import { verifyStoredOrHmacLeadToken } from "@/lib/lead-confirm";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

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
    return new NextResponse(errorHtml("El enlace de rechazo no es válido (faltan datos)."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!isAdminConfigured()) {
    return new NextResponse(errorHtml("El sistema no está disponible ahora mismo. Rechaza desde el panel de reservas."), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const db = getAdminDb();
  if (!db) {
    return new NextResponse(errorHtml("Base de datos no disponible. Rechaza desde el panel de reservas."), {
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
    action: "cancel",
    storedToken: typeof leadData.cancelToken === "string" ? leadData.cancelToken : null,
    secret,
  });

  if (!valid) {
    return new NextResponse(
      errorHtml(
        "El enlace de rechazo no es válido o ha caducado. Abre el panel de reservas y rechaza desde ahí.",
      ),
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const result = await updateBookingLeadStatus(leadId, "cancelled");
  if (!result.ok) {
    return new NextResponse(errorHtml(result.error), {
      status: result.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(resultHtml("cancel", result.emailSent, result.emailError, result.already), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
