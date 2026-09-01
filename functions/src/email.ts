import { createHmac } from "node:crypto";

type ResendEmail = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};

export async function sendResendEmail(apiKey: string, email: ResendEmail): Promise<void> {
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

export function buildTeamNotificationEmail(params: {
  leadId: string;
  data: Record<string, unknown>;
  siteUrl: string;
  confirmSecret?: string;
}): { subject: string; text: string; html: string } {
  const { leadId, data, siteUrl, confirmSecret } = params;
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
    `Estado: ${String(data.status ?? "pending")}`,
    "",
  ];

  if (items.length > 0) {
    lines.push("Detalle de la reserva:", formatBookingItems(items), "");
    if (data.estimatedTotal !== undefined) {
      lines.push(`Total estimado: ${data.estimatedTotal} €`, "");
    }
  }

  lines.push("Mensaje:", String(data.message ?? ""), "");

  if (confirmUrl) {
    lines.push("Confirmar reserva (un clic):", confirmUrl, "");
  }

  lines.push("Panel de administración:", `${siteUrl}/admin/leads`);

  const text = lines.join("\n");
  const html = [
    `<p><strong>${escapeHtml(isBooking ? "Nueva reserva" : "Nuevo contacto")}</strong> (${escapeHtml(leadId)})</p>`,
    `<p><strong>Nombre:</strong> ${escapeHtml(String(data.name ?? ""))}<br>`,
    `<strong>Email:</strong> ${escapeHtml(String(data.email ?? ""))}<br>`,
    `<strong>Teléfono:</strong> ${escapeHtml(String(data.phone ?? "—"))}</p>`,
    items.length > 0
      ? `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(formatBookingItems(items))}</pre>`
      : "",
    `<p style="white-space:pre-wrap">${escapeHtml(String(data.message ?? ""))}</p>`,
    confirmUrl
      ? `<p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:12px 20px;background:#0a4d68;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Confirmar reserva</a></p>`
      : "",
    `<p><a href="${escapeHtml(`${siteUrl}/admin/leads`)}">Abrir panel de leads</a></p>`,
  ].join("");

  const subject = isBooking
    ? `[Explora School] Nueva reserva — ${data.name ?? leadId}`
    : `[Explora School] Nuevo contacto — ${data.name ?? leadId}`;

  return { subject, text, html };
}

export function buildCustomerConfirmationEmail(params: {
  data: Record<string, unknown>;
  siteUrl: string;
}): { subject: string; text: string; html: string } {
  const { data, siteUrl } = params;
  const locale = data.locale === "en" ? "en" : "es";
  const items = Array.isArray(data.bookingItems) ? (data.bookingItems as BookingItem[]) : [];
  const isEn = locale === "en";

  const subject = isEn
    ? "Your Explora School booking is confirmed"
    : "Tu reserva en Explora School está confirmada";

  const lines = [
    isEn ? `Hello ${data.name},` : `Hola ${data.name},`,
    "",
    isEn
      ? "Great news — the Explora School team has confirmed your booking request."
      : "Buenas noticias — el equipo de Explora School ha confirmado tu solicitud de reserva.",
    "",
    isEn ? "Booking summary:" : "Resumen de la reserva:",
    formatBookingItems(items),
    "",
    data.estimatedTotal !== undefined
      ? `${isEn ? "Estimated total" : "Total estimado"}: ${data.estimatedTotal} €`
      : "",
    "",
    isEn ? "Meeting point: Borreguiles gondola, Sierra Nevada." : "Punto de encuentro: Telecabina Borreguiles, Sierra Nevada.",
    "",
    isEn
      ? "If you have any questions, reply to this email or contact us on WhatsApp."
      : "Si tienes alguna duda, responde a este correo o escríbenos por WhatsApp.",
    "",
    siteUrl,
  ].filter(Boolean);

  const text = lines.join("\n");
  const html = [
    `<p>${escapeHtml(isEn ? `Hello ${data.name},` : `Hola ${data.name},`)}</p>`,
    `<p>${escapeHtml(
      isEn
        ? "Great news — the Explora School team has confirmed your booking request."
        : "Buenas noticias — el equipo de Explora School ha confirmado tu solicitud de reserva.",
    )}</p>`,
    items.length > 0
      ? `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(formatBookingItems(items))}</pre>`
      : "",
    data.estimatedTotal !== undefined
      ? `<p><strong>${escapeHtml(isEn ? "Estimated total" : "Total estimado")}:</strong> ${data.estimatedTotal} €</p>`
      : "",
    `<p>${escapeHtml(
      isEn ? "Meeting point: Borreguiles gondola, Sierra Nevada." : "Punto de encuentro: Telecabina Borreguiles, Sierra Nevada.",
    )}</p>`,
    `<p><a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>`,
  ].join("");

  return { subject, text, html };
}
