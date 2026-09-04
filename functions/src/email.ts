import { createHmac } from "node:crypto";
import { buildArrivalGuideHtml, buildArrivalGuideText } from "./arrival-guide.js";

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

export function createLeadCancelToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(`cancel:${leadId}`).digest("hex").slice(0, 32);
}

type BookingItem = {
  productId?: string;
  date?: string;
  timeSlotLabel?: string;
  participants?: number;
  instructorName?: string;
  lineTotal?: number;
  discipline?: string;
  modality?: string;
  listUnitPrice?: number;
  notes?: string;
};

const CONTACT = {
  phoneDisplay: "+34 660 262 790",
  email: "explora.sclub@gmail.com",
  whatsappUrl:
    "https://api.whatsapp.com/send?phone=34660262790&text=%C2%A1Hola!%20Quiero%20reservar%20clases%20en%20Explora%20School",
  mapsUrl:
    "https://www.google.com/maps/place/Explora+School+%26+Club/@37.0711362,-3.3890244,17z/data=!4m6!3m5!1s0xd71c39cb043a92b:0xe698582ffd83b140!8m2!3d37.0711362!4d-3.3890244!16s%2Fg%2F11v9j767kd?hl=es",
} as const;

const PRODUCT_TITLES: Record<string, { es: string; en: string }> = {
  "full-day": { es: "Full Day", en: "Full Day" },
  "full-day-ninos": { es: "Full-day niños", en: "Full-day kids" },
  "full-day-tour": { es: "Full-day tour", en: "Full-day tour" },
  "full-day-iniciacion": { es: "Full-day iniciación", en: "Full-day beginners" },
  "full-day-tecnico": { es: "Full-day técnico", en: "Full-day technical" },
  "medio-dia": { es: "Clases Forfait medio día", en: "Half-day lift pass lessons" },
  "curso-snow": { es: "Curso de snowboard", en: "Snowboard course" },
  particular: { es: "Clases particulares", en: "Private lessons" },
  "curso-empresa": { es: "Cursos de 2 a 5 días", en: "2 to 5-day courses" },
};

const DISCIPLINE_TITLES: Record<string, { es: string; en: string }> = {
  esqui: { es: "Esquí alpino", en: "Alpine skiing" },
  snowboard: { es: "Snowboard", en: "Snowboard" },
  telemark: { es: "Telemark", en: "Telemark" },
  "esqui-adaptado": { es: "Esquí adaptado", en: "Adaptive skiing" },
  ninos: { es: "Niños", en: "Kids" },
  freestyle: { es: "Freestyle", en: "Freestyle" },
  freeride: { es: "Freeride", en: "Freeride" },
};

const BRAND = {
  pizarra: "#0e0e0f",
  hielo: "#2d6b64",
  accent: "#ea5b5e",
  nieve: "#f6f7f7",
  muted: "#5c5c5e",
  white: "#ffffff",
  border: "#d8e5e2",
} as const;

function pick(isEn: boolean, es: string, en: string): string {
  return isEn ? en : es;
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function customerNotesFromLeadMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "";
  if (!/^(NUEVA RESERVA|NEW BOOKING)\b/.test(trimmed)) return trimmed;

  const marker = trimmed.match(/(?:^|\n)(?:Mensaje adicional|Additional message):\s*\n/);
  if (!marker || marker.index === undefined) return "";

  const after = trimmed.slice(marker.index + marker[0].length);
  const end = after.search(/\n─/);
  return (end === -1 ? after : after.slice(0, end)).trim();
}

function formatDate(date: string, isEn: boolean): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString(isEn ? "en-GB" : "es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function productTitle(productId: string | undefined, isEn: boolean): string {
  if (!productId) return pick(isEn, "Clase", "Lesson");
  const titles = PRODUCT_TITLES[productId];
  if (!titles) return productId;
  return isEn ? titles.en : titles.es;
}

function disciplineLabel(
  discipline: string | undefined,
  modality: string | undefined,
  isEn: boolean,
): string | undefined {
  if (!discipline) return undefined;
  const base = DISCIPLINE_TITLES[discipline];
  const baseName = base ? (isEn ? base.en : base.es) : discipline;
  if (!modality) return baseName;
  const mod = DISCIPLINE_TITLES[modality];
  const modName = mod ? (isEn ? mod.en : mod.es) : modality;
  return `${baseName} · ${modName}`;
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
  const baseUrl = siteUrl.replace(/\/$/, "") || "https://www.explora-school.es";
  const logoUrl = `${baseUrl}/images/logo-email.png`;
  const adminUrl = `${baseUrl}/admin/leads`;
  const name = String(data.name ?? "").trim() || "Sin nombre";
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const message = customerNotesFromLeadMessage(String(data.message ?? ""));
  const locale = String(data.locale ?? "es");
  const status = String(data.status ?? (isBooking ? "pending" : "received"));
  const estimatedTotal =
    typeof data.estimatedTotal === "number" ? data.estimatedTotal : undefined;
  const confirmToken =
    typeof data.confirmToken === "string" && data.confirmToken.trim()
      ? data.confirmToken.trim()
      : confirmSecret
        ? createLeadConfirmToken(leadId, confirmSecret)
        : null;
  const cancelToken =
    typeof data.cancelToken === "string" && data.cancelToken.trim()
      ? data.cancelToken.trim()
      : confirmSecret
        ? createLeadCancelToken(leadId, confirmSecret)
        : null;
  const confirmUrl =
    isBooking && confirmToken
      ? `${baseUrl}/api/bookings/confirm?id=${encodeURIComponent(leadId)}&token=${confirmToken}`
      : null;
  const cancelUrl =
    isBooking && cancelToken
      ? `${baseUrl}/api/bookings/cancel?id=${encodeURIComponent(leadId)}&token=${cancelToken}`
      : null;

  const title = isBooking ? "Nueva reserva" : "Nuevo contacto";
  const subject = isBooking
    ? `[Explora School] Nueva reserva — ${name}`
    : `[Explora School] Nuevo contacto — ${name}`;

  const statusText =
    status === "pending"
      ? "Pendiente de confirmar"
      : status === "confirmed"
        ? "Confirmada"
        : status === "cancelled"
          ? "Cancelada"
          : status === "received"
            ? "Recibido"
            : status;
  const localeText = locale === "en" ? "Inglés" : "Español";

  const sessionText = items
    .map((item, index) => {
      const discipline = disciplineLabel(item.discipline, item.modality, false);
      return [
        `${index + 1}. ${productTitle(item.productId, false)}`,
        discipline ? `   Disciplina: ${discipline}` : "",
        item.date ? `   Fecha: ${formatDate(item.date, false)}` : "",
        item.timeSlotLabel ? `   Horario: ${item.timeSlotLabel}` : "",
        item.participants ? `   Personas: ${item.participants}` : "",
        item.instructorName ? `   Monitor/a preferido/a: ${item.instructorName}` : "",
        item.lineTotal !== undefined ? `   Precio estimado: ${item.lineTotal} €` : "",
        item.notes ? `   Notas: ${item.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const text = [
    `${title} (${leadId})`,
    "",
    `Nombre: ${name}`,
    `Email: ${email || "—"}`,
    `Teléfono: ${phone || "—"}`,
    `Idioma web: ${localeText}`,
    `Estado: ${statusText}`,
    "",
    items.length > 0 ? "Detalle de la reserva:" : "",
    sessionText,
    "",
    estimatedTotal !== undefined ? `Total estimado: ${estimatedTotal} €` : "",
    "",
    message ? "Mensaje del cliente:" : "",
    message || "",
    "",
    confirmUrl ? "Confirmar reserva (un clic):" : "",
    confirmUrl || "",
    "",
    cancelUrl ? "Rechazar reserva (un clic):" : "",
    cancelUrl || "",
    "",
    "Panel de administración:",
    adminUrl,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();

  const sessionsHtml = items
    .map((item, index) => {
      const discipline = disciplineLabel(item.discipline, item.modality, false);
      const rows: Array<[string, string]> = [["Clase", productTitle(item.productId, false)]];
      if (discipline) rows.push(["Disciplina", discipline]);
      if (item.date) rows.push(["Fecha", formatDate(item.date, false)]);
      if (item.timeSlotLabel) rows.push(["Horario", item.timeSlotLabel]);
      if (item.participants) rows.push(["Personas", String(item.participants)]);
      if (item.instructorName) rows.push(["Monitor/a preferido/a", item.instructorName]);
      if (item.lineTotal !== undefined) rows.push(["Precio estimado", `${item.lineTotal} €`]);
      if (item.notes) rows.push(["Notas", item.notes]);

      const detailRows = rows
        .map(
          ([label, value], rowIndex) => `
            <tr>
              <td style="padding:10px 0;border-top:${rowIndex === 0 ? "0" : `1px solid ${BRAND.border}`};width:38%;font-size:13px;line-height:1.4;color:${BRAND.muted};vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:10px 0;border-top:${rowIndex === 0 ? "0" : `1px solid ${BRAND.border}`};font-size:14px;line-height:1.45;color:${BRAND.pizarra};font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
            </tr>`,
        )
        .join("");

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${index === 0 ? "0" : "14px 0 0"};background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
          <tr>
            <td style="padding:16px 16px 6px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Sesión ${index + 1}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>
            </td>
          </tr>
        </table>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(
    isBooking
      ? `Reserva de ${name}. Revisa el detalle y confirma para avisar al cliente.`
      : `Mensaje de ${name}. Responde desde el panel o por email.`,
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.nieve};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.nieve};padding:24px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Explora School & Club" style="display:block;margin:0 auto 12px;border:0;outline:none;" />
              <p style="margin:0 0 8px;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${isBooking ? "#e8f4f2" : "#fef2f2"};color:${isBooking ? BRAND.hielo : BRAND.accent};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(title)}</span>
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">${escapeHtml(name)}</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted};">ID ${escapeHtml(leadId)} · ${escapeHtml(statusText)} · ${escapeHtml(localeText)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${isBooking ? BRAND.hielo : BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Cliente</p>
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:${BRAND.pizarra};">${escapeHtml(name)}</p>
                    <p style="margin:0 0 4px;font-size:14px;line-height:1.5;">${
                      email
                        ? `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(email)}</a>`
                        : "—"
                    }</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.muted};">${
                      phone
                        ? `<a href="tel:${escapeHtml(phone.replace(/\s+/g, ""))}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(phone)}</a>`
                        : "Sin teléfono"
                    }</p>
                  </td>
                </tr>
              </table>
              ${
                items.length > 0
                  ? `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Detalle de la reserva</p>${sessionsHtml}`
                  : ""
              }
              ${
                estimatedTotal !== undefined
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border-top:1px solid ${BRAND.border};">
                      <tr>
                        <td style="padding:16px 0 4px;font-size:15px;color:${BRAND.pizarra};font-weight:700;">Total estimado</td>
                        <td align="right" style="padding:16px 0 4px;font-size:20px;color:${BRAND.hielo};font-weight:700;">${escapeHtml(`${estimatedTotal} €`)}</td>
                      </tr>
                    </table>`
                  : ""
              }
              ${
                message
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">
                      <tr>
                        <td style="padding:16px 18px;background:#fffaf3;border:1px solid #ead9b8;border-radius:14px;">
                          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Mensaje del cliente</p>
                          <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.pizarra};white-space:pre-wrap;">${escapeHtml(message)}</p>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
              ${
                confirmUrl || cancelUrl
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                      <tr>
                        <td align="center" style="padding:18px;background:#eef8f3;border:1px solid #b9dfcb;border-radius:14px;">
                          <p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:${BRAND.pizarra};">Al confirmar, el cliente recibe automáticamente el email de confirmación.</p>
                          ${
                            confirmUrl
                              ? `<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;min-width:160px;margin:0 6px 8px;padding:14px 24px;background:#1f6b4a;color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;">Confirmar reserva</a>`
                              : ""
                          }
                          ${
                            cancelUrl
                              ? `<a href="${escapeHtml(cancelUrl)}" style="display:inline-block;min-width:160px;margin:0 6px 8px;padding:14px 24px;background:${BRAND.accent};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;">Rechazar</a>`
                              : ""
                          }
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
              <p style="margin:24px 0 0;text-align:center;">
                <a href="${escapeHtml(adminUrl)}" style="font-size:14px;font-weight:700;color:${BRAND.hielo};text-decoration:underline;">Abrir panel de leads</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid ${BRAND.border};background:${BRAND.nieve};font-family:Arial,Helvetica,sans-serif;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">Aviso interno · Explora School &amp; Club</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function buildCustomerConfirmationEmail(params: {
  data: Record<string, unknown>;
  siteUrl: string;
}): { subject: string; text: string; html: string } {
  const { data, siteUrl } = params;
  const isEn = data.locale === "en";
  const items = Array.isArray(data.bookingItems) ? (data.bookingItems as BookingItem[]) : [];
  const name = String(data.name ?? "").trim();
  const greetingName = firstName(name) || name;
  const baseUrl = siteUrl.replace(/\/$/, "") || "https://www.explora-school.es";
  const logoUrl = `${baseUrl}/images/logo-email.png`;
  const dayOfWhatsappUrl = `https://api.whatsapp.com/send?phone=34660262790&text=${encodeURIComponent(
    pick(
      isEn,
      "Hola, tengo un imprevisto de camino a mi clase confirmada.",
      "Hello, I have a delay on the way to my confirmed lesson.",
    ),
  )}`;
  const arrivalGuideLinks = { mapsUrl: CONTACT.mapsUrl, whatsappUrl: dayOfWhatsappUrl };

  const subject = pick(
    isEn,
    "Reserva confirmada — Explora School & Club",
    "Booking confirmed — Explora School & Club",
  );

  const preheader = pick(
    isEn,
    "Reserva confirmada. Incluye el resumen y la guía de llegada a Borreguiles (regla de los 90 minutos).",
    "Booking confirmed. Includes your summary and the arrival guide to Borreguiles (the 90-minute rule).",
  );

  const greeting = pick(
    isEn,
    greetingName ? `Hola ${greetingName},` : "Hola,",
    greetingName ? `Hello ${greetingName},` : "Hello,",
  );

  const thanks = pick(
    isEn,
    "Gracias por tu reserva en Explora School & Club. Tu solicitud ya está confirmada.",
    "Thank you for your booking with Explora School & Club. Your request is confirmed.",
  );

  const nextContact = pick(
    isEn,
    "El monitor o monitora que se encargará de tu clase se pondrá en contacto contigo en breve para formalizarla y concretar cómo abonar la clase.",
    "The instructor who will take your lesson will get in touch soon to finalise the booking and confirm how to pay for the class.",
  );

  const nothingElse = pick(
    isEn,
    "No necesitas hacer nada más para formalizar la reserva. Guarda este correo: incluye el resumen y la guía de llegada para el día de tu clase.",
    "You don’t need to do anything else to finalise the booking for now. Keep this email: it includes your summary and the arrival guide for lesson day.",
  );

  const totalNote = pick(
    isEn,
    "Total estimado (IVA incl.). El importe final se confirma con tu monitor/a al concretar el abono.",
    "Estimated total (VAT incl.). Final amount will be confirmed with your instructor when arranging payment.",
  );

  const sessionText = items
    .map((item, index) => {
      const discipline = disciplineLabel(item.discipline, item.modality, isEn);
      return [
        `${index + 1}. ${productTitle(item.productId, isEn)}`,
        discipline ? `   ${pick(isEn, "Disciplina", "Discipline")}: ${discipline}` : "",
        item.date ? `   ${pick(isEn, "Fecha", "Date")}: ${formatDate(item.date, isEn)}` : "",
        item.timeSlotLabel ? `   ${pick(isEn, "Horario", "Schedule")}: ${item.timeSlotLabel}` : "",
        item.participants
          ? `   ${pick(isEn, "Personas", "People")}: ${item.participants}`
          : "",
        item.instructorName
          ? `   ${pick(isEn, "Monitor/a preferido/a", "Preferred instructor")}: ${item.instructorName}`
          : "",
        item.lineTotal !== undefined
          ? `   ${pick(isEn, "Precio estimado", "Estimated price")}: ${item.lineTotal} €`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const text = [
    greeting,
    "",
    thanks,
    nextContact,
    "",
    nothingElse,
    "",
    items.length > 0 ? pick(isEn, "Resumen de la reserva:", "Booking summary:") : "",
    sessionText,
    "",
    data.estimatedTotal !== undefined
      ? `${pick(isEn, "Total estimado", "Estimated total")}: ${data.estimatedTotal} €`
      : "",
    data.estimatedTotal !== undefined ? totalNote : "",
    "",
    buildArrivalGuideText(isEn, arrivalGuideLinks),
    "",
    pick(isEn, "¿Dudas?", "Questions?"),
    `WhatsApp: ${CONTACT.phoneDisplay}`,
    `Email: ${CONTACT.email}`,
    CONTACT.whatsappUrl,
    "",
    "Explora School & Club",
    "Sierra Nevada · Granada",
    baseUrl,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();

  const sessionsHtml = items
    .map((item, index) => {
      const discipline = disciplineLabel(item.discipline, item.modality, isEn);
      const rows: Array<[string, string]> = [
        [pick(isEn, "Clase", "Lesson"), productTitle(item.productId, isEn)],
      ];
      if (discipline) rows.push([pick(isEn, "Disciplina", "Discipline"), discipline]);
      if (item.date) rows.push([pick(isEn, "Fecha", "Date"), formatDate(item.date, isEn)]);
      if (item.timeSlotLabel) {
        rows.push([pick(isEn, "Horario", "Schedule"), item.timeSlotLabel]);
      }
      if (item.participants) {
        rows.push([pick(isEn, "Personas", "People"), String(item.participants)]);
      }
      if (item.instructorName) {
        rows.push([
          pick(isEn, "Monitor/a preferido/a", "Preferred instructor"),
          item.instructorName,
        ]);
      }
      if (item.lineTotal !== undefined) {
        rows.push([pick(isEn, "Precio estimado", "Estimated price"), `${item.lineTotal} €`]);
      }

      const detailRows = rows
        .map(
          ([label, value], rowIndex) => `
            <tr>
              <td style="padding:10px 0;border-top:${rowIndex === 0 ? "0" : `1px solid ${BRAND.border}`};width:38%;font-size:13px;line-height:1.4;color:${BRAND.muted};vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:10px 0;border-top:${rowIndex === 0 ? "0" : `1px solid ${BRAND.border}`};font-size:14px;line-height:1.45;color:${BRAND.pizarra};font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
            </tr>`,
        )
        .join("");

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${index === 0 ? "0" : "16px 0 0"};background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
          <tr>
            <td style="padding:18px 18px 8px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">
                ${escapeHtml(pick(isEn, `Sesión ${index + 1}`, `Session ${index + 1}`))}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>
            </td>
          </tr>
        </table>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.nieve};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.nieve};padding:28px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <a href="${escapeHtml(baseUrl)}" style="text-decoration:none;">
                <img src="${escapeHtml(logoUrl)}" width="88" height="88" alt="Explora School & Club" style="display:block;margin:0 auto 14px;border:0;outline:none;" />
              </a>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                ${escapeHtml(pick(isEn, "Reserva confirmada", "Booking confirmed"))}
              </p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">
                Explora School &amp; Club
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND.hielo};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:${BRAND.pizarra};">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(thanks)}</p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(nextContact)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#fef2f2;border:1px solid #f3c0c2;border-radius:12px;">
                <tr><td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(nothingElse)}</td></tr>
              </table>
              ${
                items.length > 0
                  ? `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">${escapeHtml(pick(isEn, "Resumen de la reserva", "Booking summary"))}</p>${sessionsHtml}`
                  : ""
              }
              ${
                data.estimatedTotal !== undefined
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-top:1px solid ${BRAND.border};">
                      <tr>
                        <td style="padding:18px 0 4px;font-size:15px;color:${BRAND.pizarra};font-weight:700;">${escapeHtml(pick(isEn, "Total estimado", "Estimated total"))}</td>
                        <td align="right" style="padding:18px 0 4px;font-size:20px;color:${BRAND.hielo};font-weight:700;">${escapeHtml(`${data.estimatedTotal} €`)}</td>
                      </tr>
                      <tr><td colspan="2" style="padding:0 0 4px;font-size:13px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(totalNote)}</td></tr>
                    </table>`
                  : ""
              }
              ${buildArrivalGuideHtml(isEn, arrivalGuideLinks, BRAND)}
              <p style="margin:28px 0 12px;font-size:15px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(pick(isEn, "Si tienes alguna duda, responde a este correo o escríbenos por WhatsApp.", "If you have any questions, reply to this email or write to us on WhatsApp."))}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td style="border-radius:999px;background:${BRAND.accent};">
                    <a href="${escapeHtml(CONTACT.whatsappUrl)}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.white};text-decoration:none;">${escapeHtml(pick(isEn, "WhatsApp Explora", "WhatsApp Explora"))}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(CONTACT.phoneDisplay)} · <a href="mailto:${escapeHtml(CONTACT.email)}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(CONTACT.email)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.nieve};font-family:Arial,Helvetica,sans-serif;text-align:center;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${BRAND.pizarra};">Explora School &amp; Club</p>
              <p style="margin:0 0 10px;font-size:13px;color:${BRAND.muted};">Sierra Nevada · Granada</p>
              <a href="${escapeHtml(baseUrl)}" style="font-size:13px;color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(baseUrl.replace(/^https?:\/\//, ""))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
