import { site } from "@/data/site";
import {
  getDisciplineDisplayName,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { media } from "@/lib/media";
import { earlyBirdDiscountLabel } from "@/lib/promotions";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export type ConfirmationBookingItem = {
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
  data: Record<string, unknown>;
  siteUrl: string;
};

const BRAND = {
  pizarra: "#0a1219",
  hielo: "#1a5568",
  accent: "#e85a35",
  nieve: "#f5f8fb",
  muted: "#445661",
  frost: "#a8c8d8",
  white: "#ffffff",
  border: "#d7e3ea",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(isEn: boolean, es: string, en: string): string {
  return isEn ? en : es;
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
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

function formatEuro(amount: number): string {
  return `${amount} €`;
}

function productTitle(productId: string | undefined, isEn: boolean): string {
  if (!productId) return isEn ? "Lesson" : "Clase";
  const product = getProductBySlug(productId as ProductId);
  if (!product) return productId;
  return isEn ? product.titleEn : product.titleEs;
}

function resolveLogoUrl(siteUrl: string): string {
  const base = (siteUrl || PRODUCTION_SITE_URL).replace(/\/$/, "");
  return `${base}${media.logoEmail}`;
}

function resolveItems(data: Record<string, unknown>): ConfirmationBookingItem[] {
  return Array.isArray(data.bookingItems) ? (data.bookingItems as ConfirmationBookingItem[]) : [];
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

function resolveSessions(items: ConfirmationBookingItem[], isEn: boolean): ResolvedSession[] {
  return items.map((item) => {
    const discipline = getDisciplineDisplayName(
      isEn ? "en" : "es",
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    );

    let priceLabel = item.lineTotal !== undefined ? formatEuro(item.lineTotal) : "—";
    if (
      item.listUnitPrice !== undefined &&
      item.lineTotal !== undefined &&
      item.listUnitPrice > item.lineTotal
    ) {
      priceLabel = `${formatEuro(item.lineTotal)} (${earlyBirdDiscountLabel(isEn ? "en" : "es")})`;
    }

    return {
      title: productTitle(item.productId, isEn),
      discipline,
      dateLabel: item.date ? formatDate(item.date, isEn) : "—",
      schedule: item.timeSlotLabel?.trim() || "—",
      people:
        item.participants !== undefined
          ? pick(
              isEn,
              `${item.participants} ${item.participants === 1 ? "persona" : "personas"}`,
              `${item.participants} ${item.participants === 1 ? "person" : "people"}`,
            )
          : "—",
      instructor: item.instructorName?.trim() || undefined,
      priceLabel,
      notes: item.notes?.trim() || undefined,
    };
  });
}

function buildTextSummary(sessions: ResolvedSession[], isEn: boolean): string {
  if (sessions.length === 0) return "";
  return sessions
    .map((session, index) => {
      const lines = [
        `${index + 1}. ${session.title}`,
        session.discipline
          ? `   ${pick(isEn, "Disciplina", "Discipline")}: ${session.discipline}`
          : "",
        `   ${pick(isEn, "Fecha", "Date")}: ${session.dateLabel}`,
        `   ${pick(isEn, "Horario", "Schedule")}: ${session.schedule}`,
        `   ${pick(isEn, "Personas", "People")}: ${session.people}`,
        session.instructor
          ? `   ${pick(isEn, "Monitor/a preferido/a", "Preferred instructor")}: ${session.instructor}`
          : "",
        `   ${pick(isEn, "Precio estimado", "Estimated price")}: ${session.priceLabel}`,
        session.notes ? `   ${pick(isEn, "Notas", "Notes")}: ${session.notes}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function sessionRowsHtml(sessions: ResolvedSession[], isEn: boolean): string {
  if (sessions.length === 0) return "";

  return sessions
    .map((session, index) => {
      const rows: Array<[string, string]> = [
        [pick(isEn, "Clase", "Lesson"), session.title],
      ];
      if (session.discipline) {
        rows.push([pick(isEn, "Disciplina", "Discipline"), session.discipline]);
      }
      rows.push(
        [pick(isEn, "Fecha", "Date"), session.dateLabel],
        [pick(isEn, "Horario", "Schedule"), session.schedule],
        [pick(isEn, "Personas", "People"), session.people],
      );
      if (session.instructor) {
        rows.push([pick(isEn, "Monitor/a preferido/a", "Preferred instructor"), session.instructor]);
      }
      rows.push([pick(isEn, "Precio estimado", "Estimated price"), session.priceLabel]);
      if (session.notes) {
        rows.push([pick(isEn, "Notas", "Notes"), session.notes]);
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
}

export function buildCustomerConfirmationEmail({
  data,
  siteUrl,
}: BuildParams): { subject: string; text: string; html: string } {
  const isEn = data.locale === "en";
  const name = String(data.name ?? "").trim();
  const greetingName = firstName(name) || name;
  const items = resolveItems(data);
  const sessions = resolveSessions(items, isEn);
  const estimatedTotal =
    typeof data.estimatedTotal === "number" ? data.estimatedTotal : undefined;
  const logoUrl = resolveLogoUrl(siteUrl);
  const mapsUrl = site.meetingPoint.googleMapsUrl;
  const whatsappUrl = site.whatsappUrl;
  const baseUrl = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;

  const subject = pick(
    isEn,
    "Reserva confirmada — Explora School & Club",
    "Booking confirmed — Explora School & Club",
  );

  const preheader = pick(
    isEn,
    "Thank you for your booking. Your instructor will get in touch to finalise it and confirm how to pay for the class.",
    "Gracias por tu reserva. Tu monitor/a se pondrá en contacto para formalizarla y concretar cómo abonar la clase.",
  );

  const greeting = pick(
    isEn,
    greetingName ? `Hello ${greetingName},` : "Hello,",
    greetingName ? `Hola ${greetingName},` : "Hola,",
  );

  const thanks = pick(
    isEn,
    "Thank you for your booking with Explora School & Club. Your request is confirmed.",
    "Gracias por tu reserva en Explora School & Club. Tu solicitud ya está confirmada.",
  );

  const nextContact = pick(
    isEn,
    "The instructor who will take your lesson will get in touch soon to finalise the booking and confirm how to pay for the class.",
    "El monitor o monitora que se encargará de tu clase se pondrá en contacto contigo en breve para formalizarla y concretar cómo abonar la clase.",
  );

  const nothingElse = pick(
    isEn,
    "You don’t need to do anything else for now. Keep this email handy as a summary of your booking.",
    "No necesitas hacer nada más por ahora. Guarda este correo como resumen de tu reserva.",
  );

  const meetingPoint = pick(
    isEn,
    "Explora School & Club at Sierra Nevada ski resort. Your instructor wears the Explora uniform. Full-Day: pick-up and drop-off on request.",
    "Explora School & Club en la estación de esquí de Sierra Nevada. El monitor o monitora lleva uniforme Explora. En Full-Day: recogida y entrega donde se solicite.",
  );

  const totalNote = pick(
    isEn,
    "Estimated total (VAT incl.). Final amount will be confirmed with your instructor when arranging payment.",
    "Total estimado (IVA incl.). El importe final se confirma con tu monitor/a al concretar el abono.",
  );

  const text = [
    greeting,
    "",
    thanks,
    nextContact,
    "",
    nothingElse,
    "",
    sessions.length > 0 ? pick(isEn, "Booking summary:", "Resumen de la reserva:") : "",
    buildTextSummary(sessions, isEn),
    "",
    estimatedTotal !== undefined
      ? `${pick(isEn, "Estimated total", "Total estimado")}: ${formatEuro(estimatedTotal)}`
      : "",
    estimatedTotal !== undefined ? totalNote : "",
    "",
    pick(isEn, "Meeting point:", "Punto de encuentro:"),
    meetingPoint,
    mapsUrl,
    "",
    pick(isEn, "Questions?", "¿Dudas?"),
    pick(
      isEn,
      `WhatsApp: ${site.phoneDisplay}`,
      `WhatsApp: ${site.phoneDisplay}`,
    ),
    pick(isEn, `Email: ${site.email}`, `Email: ${site.email}`),
    whatsappUrl,
    "",
    "Explora School & Club",
    "Sierra Nevada · Granada",
    baseUrl,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();

  const html = `<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
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
                ${escapeHtml(pick(isEn, "Booking confirmed", "Reserva confirmada"))}
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

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#fff7f4;border:1px solid #f3c7b8;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">
                    ${escapeHtml(nothingElse)}
                  </td>
                </tr>
              </table>

              ${
                sessions.length > 0
                  ? `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">${escapeHtml(pick(isEn, "Booking summary", "Resumen de la reserva"))}</p>${sessionRowsHtml(sessions, isEn)}`
                  : ""
              }

              ${
                estimatedTotal !== undefined
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-top:1px solid ${BRAND.border};">
                      <tr>
                        <td style="padding:18px 0 4px;font-size:15px;color:${BRAND.pizarra};font-weight:700;">
                          ${escapeHtml(pick(isEn, "Estimated total", "Total estimado"))}
                        </td>
                        <td align="right" style="padding:18px 0 4px;font-size:20px;color:${BRAND.hielo};font-weight:700;">
                          ${escapeHtml(formatEuro(estimatedTotal))}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:0 0 4px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                          ${escapeHtml(totalNote)}
                        </td>
                      </tr>
                    </table>`
                  : ""
              }

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
                <tr>
                  <td style="padding:18px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">
                      ${escapeHtml(pick(isEn, "Meeting point", "Punto de encuentro"))}
                    </p>
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">
                      ${escapeHtml(meetingPoint)}
                    </p>
                    <a href="${escapeHtml(mapsUrl)}" style="display:inline-block;font-size:14px;font-weight:700;color:${BRAND.hielo};text-decoration:underline;">
                      ${escapeHtml(pick(isEn, "Open in Google Maps", "Abrir en Google Maps"))}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 12px;font-size:15px;line-height:1.55;color:${BRAND.pizarra};">
                ${escapeHtml(
                  pick(
                    isEn,
                    "If you have any questions, reply to this email or write to us on WhatsApp.",
                    "Si tienes alguna duda, responde a este correo o escríbenos por WhatsApp.",
                  ),
                )}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td style="border-radius:999px;background:${BRAND.accent};">
                    <a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.white};text-decoration:none;">
                      ${escapeHtml(pick(isEn, "WhatsApp Explora", "WhatsApp Explora"))}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                ${escapeHtml(site.phoneDisplay)} ·
                <a href="mailto:${escapeHtml(site.email)}" style="color:${BRAND.hielo};text-decoration:underline;">${escapeHtml(site.email)}</a>
              </p>
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
