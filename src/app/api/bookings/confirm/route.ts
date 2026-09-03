import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildBookingActionResultHtml } from "@/lib/booking-action-result";
import { updateBookingLeadStatus } from "@/lib/booking-status";
import { verifyLeadConfirmToken } from "@/lib/lead-confirm";
import type { LeadStatus } from "@/lib/leads";
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

  const result = await updateBookingLeadStatus(leadId, "confirmed");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
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
