import { NextResponse } from "next/server";
import { buildBookingActionResultHtml } from "@/lib/booking-action-result";
import { updateBookingLeadStatus } from "@/lib/booking-status";
import { verifyLeadCancelToken } from "@/lib/lead-confirm";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");
  const token = searchParams.get("token");
  const secret = process.env.LEAD_CONFIRM_SECRET;

  if (!leadId || !token || !secret) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!verifyLeadCancelToken(leadId, token, secret)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const result = await updateBookingLeadStatus(leadId, "cancelled");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL).replace(/\/$/, "");
  const html = buildBookingActionResultHtml({
    kind: "cancel",
    already: result.already,
    emailSent: result.emailSent,
    emailError: result.emailError,
    siteUrl,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
