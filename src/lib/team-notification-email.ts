import { createLeadCancelToken, createLeadConfirmToken } from "@/lib/lead-confirm";
import { customerNotesFromLeadMessage } from "@/lib/lead-message";
import { media } from "@/lib/media";
import { earlyBirdDiscountLabel } from "@/lib/promotions";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import {
  getDisciplineDisplayName,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";

type TeamBookingItem = {
  productId?: string;
  date?: string;
  timeSlotLabel?: string;
  participants?: number;
  discipline?: string;
  modality?: string;
  instructorName?: string;
  lineTotal?: number;
  listUnitPrice?: number;
  notes?: string;
};

type BuildParams = {
  leadId: string;
  data: Record<string, unknown>;
  siteUrl: string;
  confirmSecret?: string;
};

const BRAND = {
  pizarra: "#0e0e0f",
  hielo: "#2d6b64",
  accent: "#ea5b5e",
  nieve: "#f6f7f7",
  muted: "#5c5c5e",
  white: "#ffffff",
  border: "#d8e5e2",
  success: "#1f6b4a",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function formatEuro(amount: number): string {
  return `${amount} €`;
}

function productTitle(productId: string | undefined): string {
  if (!productId) return "Clase";
  const product = getProductBySlug(productId as ProductId);
  return product?.titleEs ?? productId;
}

function resolveLogoUrl(siteUrl: string): string {
  const base = (siteUrl || PRODUCTION_SITE_URL).replace(/\/$/, "");
  return `${base}${media.logoEmail}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente de confirmar";
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Rechazada";
    case "received":
      return "Recibido";
    default:
      return status || "—";
  }
}

function localeLabel(locale: string): string {
  return locale === "en" ? "Inglés" : "Español";
}

type ResolvedSession = {
  title: string;
  discipline?: string;
  dateLabel: string;
  schedule: string;
  people: string;
  instructor?: string;
  priceLabel: string;
  notes?: string;
};

function resolveSessions(items: TeamBookingItem[]): ResolvedSession[] {
  return items.map((item) => {
    const discipline = getDisciplineDisplayName(
      "es",
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    );

    let priceLabel = item.lineTotal !== undefined ? formatEuro(item.lineTotal) : "—";
    if (
      item.listUnitPrice !== undefined &&
      item.lineTotal !== undefined &&
      item.listUnitPrice > item.lineTotal
    ) {
      priceLabel = `${formatEuro(item.lineTotal)} (${earlyBirdDiscountLabel("es")})`;
    }

    return {
      title: productTitle(item.productId),
      discipline,
      dateLabel: item.date ? formatDate(item.date) : "—",
      schedule: item.timeSlotLabel?.trim() || "—",
      people:
        item.participants !== undefined
          ? `${item.participants} ${item.participants === 1 ? "persona" : "personas"}`
          : "—",
      instructor: item.instructorName?.trim() || undefined,
      priceLabel,
      notes: item.notes?.trim() || undefined,
    };
  });
}

function buildTextSummary(sessions: ResolvedSession[]): string {
  if (sessions.length === 0) return "";
  return sessions
    .map((session, index) => {
      const lines = [
        `${index + 1}. ${session.title}`,
        session.discipline ? `   Disciplina: ${session.discipline}` : "",
        `   Fecha: ${session.dateLabel}`,
        `   Horario: ${session.schedule}`,
        `   Personas: ${session.people}`,
        session.instructor ? `   Monitor/a preferido/a: ${session.instructor}` : "",
        `   Precio estimado: ${session.priceLabel}`,
        session.notes ? `   Notas: ${session.notes}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function sessionRowsHtml(sessions: ResolvedSession[]): string {
  if (sessions.length === 0) return "";

  return sessions
    .map((session, index) => {
      const rows: Array<[string, string]> = [["Clase", session.title]];
      if (session.discipline) rows.push(["Disciplina", session.discipline]);
      rows.push(
        ["Fecha", session.dateLabel],
        ["Horario", session.schedule],
        ["Personas", session.people],
      );
      if (session.instructor) rows.push(["Monitor/a preferido/a", session.instructor]);
      rows.push(["Precio estimado", session.priceLabel]);
      if (session.notes) rows.push(["Notas", session.notes]);

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
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">
                Sesión ${index + 1}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>
            </td>
          </tr>
        </table>`;
    })
    .join("");
}

export function buildTeamNotificationEmail({
  leadId,
  data,
  siteUrl,
  confirmSecret,
}: BuildParams): { subject: string; text: string; html: string } {
  const isBooking = data.type === "booking" || data.source === "booking-cart";
  const items = Array.isArray(data.bookingItems) ? (data.bookingItems as TeamBookingItem[]) : [];
  const sessions = resolveSessions(items);
  const baseUrl = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;
  const logoUrl = resolveLogoUrl(baseUrl);
  const adminUrl = `${baseUrl}/admin/reservas`;
  const name = String(data.name ?? "").trim() || "Sin nombre";
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const message = customerNotesFromLeadMessage(String(data.message ?? ""));
  const locale = String(data.locale ?? "es");
  const status = String(data.status ?? (isBooking ? "pending" : "received"));
  const estimatedTotal =
    typeof data.estimatedTotal === "number" ? data.estimatedTotal : undefined;
  const confirmUrl =
    isBooking && confirmSecret
      ? `${baseUrl}/api/bookings/confirm?id=${encodeURIComponent(leadId)}&token=${createLeadConfirmToken(leadId, confirmSecret)}`
      : null;
  const cancelUrl =
    isBooking && confirmSecret
      ? `${baseUrl}/api/bookings/cancel?id=${encodeURIComponent(leadId)}&token=${createLeadCancelToken(leadId, confirmSecret)}`
      : null;

  const title = isBooking ? "Nueva reserva" : "Nuevo contacto";
  const subject = isBooking
    ? `[Explora School] Nueva reserva — ${name}`
    : `[Explora School] Nuevo contacto — ${name}`;

  const preheader = isBooking
    ? `Reserva de ${name}. Confirma o rechaza desde este email.`
    : `Mensaje de ${name}. Responde desde el panel o por email.`;

  const text = [
    `${title} (${leadId})`,
    "",
    `Nombre: ${name}`,
    `Email: ${email || "—"}`,
    `Teléfono: ${phone || "—"}`,
    `Idioma web: ${localeLabel(locale)}`,
    `Estado: ${statusLabel(status)}`,
    "",
    sessions.length > 0 ? "Detalle de la reserva:" : "",
    buildTextSummary(sessions),
    "",
    estimatedTotal !== undefined ? `Total estimado: ${formatEuro(estimatedTotal)}` : "",
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

  const html = `<!DOCTYPE html>
<html lang="es">
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
            <td style="background:${BRAND.nieve};padding:24px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Explora School & Club" style="display:block;margin:0 auto 12px;border:0;outline:none;" />
              <p style="margin:0 0 8px;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${isBooking ? "#e8f4f2" : "#fef2f2"};color:${isBooking ? BRAND.hielo : BRAND.accent};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                  ${escapeHtml(title)}
                </span>
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                ${escapeHtml(name)}
              </p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted};">
                ID ${escapeHtml(leadId)} · ${escapeHtml(statusLabel(status))} · ${escapeHtml(localeLabel(locale))}
              </p>
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
                    <p style="margin:0 0 4px;font-size:14px;line-height:1.5;">
                      ${
                        email
                          ? `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(email)}</a>`
                          : "—"
                      }
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.muted};">
                      ${
                        phone
                          ? `<a href="tel:${escapeHtml(phone.replace(/\s+/g, ""))}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(phone)}</a>`
                          : "Sin teléfono"
                      }
                    </p>
                  </td>
                </tr>
              </table>

              ${
                sessions.length > 0
                  ? `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Detalle de la reserva</p>${sessionRowsHtml(sessions)}`
                  : ""
              }

              ${
                estimatedTotal !== undefined
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border-top:1px solid ${BRAND.border};">
                      <tr>
                        <td style="padding:16px 0 4px;font-size:15px;color:${BRAND.pizarra};font-weight:700;">Total estimado</td>
                        <td align="right" style="padding:16px 0 4px;font-size:20px;color:${BRAND.hielo};font-weight:700;">${escapeHtml(formatEuro(estimatedTotal))}</td>
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
                        <td style="padding:18px;background:#f7faf9;border:1px solid ${BRAND.border};border-radius:14px;">
                          <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${BRAND.pizarra};text-align:center;">
                            Elige una acción. El cliente recibirá automáticamente el email correspondiente.
                          </p>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              ${
                                confirmUrl
                                  ? `<td align="center" style="padding:4px;">
                                      <a href="${escapeHtml(confirmUrl)}" style="display:inline-block;min-width:160px;padding:14px 20px;background:${BRAND.success};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;text-align:center;">
                                        Confirmar reserva
                                      </a>
                                    </td>`
                                  : ""
                              }
                              ${
                                cancelUrl
                                  ? `<td align="center" style="padding:4px;">
                                      <a href="${escapeHtml(cancelUrl)}" style="display:inline-block;min-width:160px;padding:14px 20px;background:${BRAND.accent};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;text-align:center;">
                                        Rechazar reserva
                                      </a>
                                    </td>`
                                  : ""
                              }
                            </tr>
                          </table>
                          <p style="margin:14px 0 0;font-size:12px;line-height:1.45;color:${BRAND.muted};text-align:center;">
                            Confirmar → email de confirmación · Rechazar → email de no disponibilidad
                          </p>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }

              <p style="margin:24px 0 0;text-align:center;">
                <a href="${escapeHtml(adminUrl)}" style="font-size:14px;font-weight:700;color:${BRAND.hielo};text-decoration:underline;">Abrir panel de reservas</a>
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
