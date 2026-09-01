import { createHmac } from "node:crypto";

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};

export async function sendResendEmail(email: ResendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[resend] RESEND_API_KEY not set — skipping email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API ${response.status}: ${body}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createLeadConfirmToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(leadId).digest("hex").slice(0, 32);
}

type BookingItem = {
  productId?: string;
  date?: string;
  timeSlotLabel?: string;
  participants?: number;
  instructorName?: string;
  lineTotal?: number;
};

function formatBookingItems(items: BookingItem[] | undefined): string {
  if (!items?.length) return "";
  return items
    .map((item, index) => {
      const parts = [
        `${index + 1}. ${item.productId ?? "Sesión"}`,
        item.date ? `   Fecha: ${item.date}` : "",
        item.timeSlotLabel ? `   Horario: ${item.timeSlotLabel}` : "",
        item.participants ? `   Personas: ${item.participants}` : "",
        item.instructorName ? `   Instructor/a: ${item.instructorName}` : "",
        item.lineTotal !== undefined ? `   Precio: ${item.lineTotal} €` : "",
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
}

function getEmailConfig() {
  return {
    from: process.env.RESEND_FROM ?? "Explora School <onboarding@resend.dev>",
    teamTo: process.env.LEAD_NOTIFICATION_EMAIL ?? "explora.sclub@gmail.com",
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.explora-school.es").replace(/\/$/, ""),
    confirmSecret: process.env.LEAD_CONFIRM_SECRET,
  };
}

export async function sendTeamLeadNotification(
  leadId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const { from, teamTo, siteUrl, confirmSecret } = getEmailConfig();
  const isBooking = data.type === "booking" || data.source === "booking-cart";
  const items = Array.isArray(data.bookingItems) ? (data.bookingItems as BookingItem[]) : [];
  const confirmUrl =
    isBooking && confirmSecret
      ? `${siteUrl}/api/bookings/confirm?id=${encodeURIComponent(leadId)}&token=${createLeadConfirmToken(leadId, confirmSecret)}`
      : null;

  const lines = [
    isBooking ? `Nueva reserva (${leadId})` : `Nuevo contacto (${leadId})`,
    "",
    `Nombre: ${String(data.name ?? "")}`,
    `Email: ${String(data.email ?? "")}`,
    `Teléfono: ${String(data.phone ?? "—")}`,
    "",
  ];

  if (items.length > 0) {
    lines.push("Detalle de la reserva:", formatBookingItems(items), "");
    if (data.estimatedTotal !== undefined) {
      lines.push(`Total estimado: ${data.estimatedTotal} €`, "");
    }
  }

  lines.push("Mensaje:", String(data.message ?? ""), "");
  if (confirmUrl) lines.push("Confirmar reserva:", confirmUrl, "");
  lines.push("Panel:", `${siteUrl}/admin/leads`);

  const subject = isBooking
    ? `[Explora School] Nueva reserva — ${data.name ?? leadId}`
    : `[Explora School] Nuevo contacto — ${data.name ?? leadId}`;

  const text = lines.join("\n");
  const html = [
    `<p><strong>${escapeHtml(isBooking ? "Nueva reserva" : "Nuevo contacto")}</strong></p>`,
    `<p><strong>Nombre:</strong> ${escapeHtml(String(data.name ?? ""))}<br>`,
    `<strong>Email:</strong> ${escapeHtml(String(data.email ?? ""))}</p>`,
    items.length > 0
      ? `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(formatBookingItems(items))}</pre>`
      : "",
    confirmUrl
      ? `<p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:12px 20px;background:#0a4d68;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Confirmar reserva</a></p>`
      : "",
    `<p><a href="${escapeHtml(`${siteUrl}/admin/leads`)}">Panel de leads</a></p>`,
  ].join("");

  await sendResendEmail({ from, to: [teamTo], subject, text, html });
}

export async function sendCustomerBookingConfirmation(data: Record<string, unknown>): Promise<void> {
  const { from, siteUrl } = getEmailConfig();
  const locale = data.locale === "en" ? "en" : "es";
  const items = Array.isArray(data.bookingItems) ? (data.bookingItems as BookingItem[]) : [];
  const isEn = locale === "en";
  const customerEmail = String(data.email ?? "");
  if (!customerEmail) return;

  const subject = isEn
    ? "Your Explora School booking is confirmed"
    : "Tu reserva en Explora School está confirmada";

  const text = [
    isEn ? `Hello ${data.name},` : `Hola ${data.name},`,
    "",
    isEn
      ? "The Explora School team has confirmed your booking."
      : "El equipo de Explora School ha confirmado tu reserva.",
    "",
    formatBookingItems(items),
    data.estimatedTotal !== undefined ? `Total: ${data.estimatedTotal} €` : "",
    "",
    siteUrl,
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    `<p>${escapeHtml(isEn ? `Hello ${data.name},` : `Hola ${data.name},`)}</p>`,
    `<p>${escapeHtml(
      isEn
        ? "The Explora School team has confirmed your booking."
        : "El equipo de Explora School ha confirmado tu reserva.",
    )}</p>`,
    items.length > 0
      ? `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(formatBookingItems(items))}</pre>`
      : "",
    `<p><a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>`,
  ].join("");

  await sendResendEmail({ from, to: [customerEmail], subject, text, html });
}
