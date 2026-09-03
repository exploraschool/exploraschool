import { site } from "@/data/site";
import {
  getDisciplineDisplayName,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { media } from "@/lib/media";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

type CancellationBookingItem = {
  productId?: string;
  date?: string;
  timeSlotLabel?: string;
  participants?: number;
  discipline?: string;
  modality?: string;
};

type BuildParams = {
  data: Record<string, unknown>;
  siteUrl: string;
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

export function buildCustomerCancellationEmail({
  data,
  siteUrl,
}: BuildParams): { subject: string; text: string; html: string } {
  // Rechazo al cliente: siempre en español (idioma operativo del club).
  const isEn = false;
  const name = String(data.name ?? "").trim();
  const greetingName = firstName(name) || name;
  const items = Array.isArray(data.bookingItems)
    ? (data.bookingItems as CancellationBookingItem[])
    : [];
  const logoUrl = resolveLogoUrl(siteUrl);
  const baseUrl = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;
  const classesUrl = `${baseUrl}/${isEn ? "en" : "es"}/clases`;

  const subject = pick(
    isEn,
    "No hemos podido confirmar tu reserva — Explora School & Club",
    "We could not confirm your booking — Explora School & Club",
  );

  const preheader = pick(
    isEn,
    "Lo sentimos: no hemos podido confirmar tu solicitud para las fechas seleccionadas.",
    "We are sorry: your booking request could not be confirmed for the selected dates.",
  );

  const greeting = pick(
    isEn,
    greetingName ? `Hola ${greetingName},` : "Hola,",
    greetingName ? `Hello ${greetingName},` : "Hello,",
  );

  const body = pick(
    isEn,
    "Gracias por tu interés en Explora School & Club. Lamentablemente no podemos confirmar tu solicitud de reserva para las fechas y horarios que elegiste (disponibilidad, tamaño del grupo u horario).",
    "Thank you for your interest in Explora School & Club. Unfortunately we cannot confirm your booking request for the dates and slots you chose (availability, group size or schedule).",
  );

  const next = pick(
    isEn,
    "Si quieres probar otras fechas u otros formatos de clase, responde a este email o escríbenos por WhatsApp y te ayudamos a buscar una alternativa.",
    "If you would like to try other dates or lesson formats, reply to this email or write to us on WhatsApp and we will help you find an alternative.",
  );

  const summaryLines = items.map((item, index) => {
    const discipline = getDisciplineDisplayName(
      isEn ? "en" : "es",
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    );
    const dateLabel = item.date ? formatDate(item.date, isEn) : "—";
    return [
      `${index + 1}. ${productTitle(item.productId, isEn)}`,
      discipline ? `   ${pick(isEn, "Disciplina", "Discipline")}: ${discipline}` : "",
      `   ${pick(isEn, "Fecha", "Date")}: ${dateLabel}`,
      `   ${pick(isEn, "Horario", "Schedule")}: ${item.timeSlotLabel ?? "—"}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const text = [
    greeting,
    "",
    body,
    "",
    next,
    "",
    items.length > 0 ? pick(isEn, "Resumen de la solicitud:", "Request summary:") : "",
    ...summaryLines,
    "",
    pick(isEn, "Contacto:", "Contact:"),
    site.email,
    site.phoneDisplay,
    site.whatsappUrl,
    "",
    pick(isEn, "Ver clases:", "Browse lessons:"),
    classesUrl,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();

  const sessionHtml = items
    .map((item, index) => {
      const discipline = getDisciplineDisplayName(
        isEn ? "en" : "es",
        item.discipline as MainDisciplineId | undefined,
        item.modality as ModalityId | undefined,
      );
      const dateLabel = item.date ? formatDate(item.date, isEn) : "—";
      return `
        <tr>
          <td style="padding:12px 14px;border-top:${index === 0 ? "0" : `1px solid ${BRAND.border}`};">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.pizarra};">${escapeHtml(productTitle(item.productId, isEn))}</p>
            <p style="margin:0;font-size:13px;line-height:1.45;color:${BRAND.muted};">
              ${escapeHtml([discipline, dateLabel, item.timeSlotLabel].filter(Boolean).join(" · "))}
            </p>
          </td>
        </tr>`;
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
            <td style="background:${BRAND.nieve};padding:24px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="88" height="88" alt="Explora School & Club" style="display:block;margin:0 auto 14px;border:0;outline:none;" />
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.accent};font-weight:700;">
                ${escapeHtml(pick(isEn, "Actualización de reserva", "Booking update"))}
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                ${escapeHtml(pick(isEn, "No hemos podido confirmar tu reserva", "We could not confirm your booking"))}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(body)}</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(next)}</p>

              ${
                items.length > 0
                  ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">${escapeHtml(pick(isEn, "Tu solicitud", "Your request"))}</p>
                     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">${sessionHtml}</table>`
                  : ""
              }

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td align="center" style="padding:18px;background:#fef2f2;border:1px solid #f0c4c5;border-radius:14px;">
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:${BRAND.pizarra};">
                      ${escapeHtml(pick(isEn, "¿Te ayudamos a buscar otra opción?", "Need help finding another slot?"))}
                    </p>
                    <a href="${escapeHtml(site.whatsappUrl)}" style="display:inline-block;padding:12px 20px;background:${BRAND.hielo};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;margin:0 6px 8px;">
                      WhatsApp
                    </a>
                    <a href="${escapeHtml(classesUrl)}" style="display:inline-block;padding:12px 20px;background:${BRAND.white};color:${BRAND.hielo};text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;border:1px solid ${BRAND.border};margin:0 6px 8px;">
                      ${escapeHtml(pick(isEn, "Ver clases", "View lessons"))}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                ${escapeHtml(site.email)} · ${escapeHtml(site.phoneDisplay)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid ${BRAND.border};background:${BRAND.nieve};font-family:Arial,Helvetica,sans-serif;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">Explora School &amp; Club · Sierra Nevada</p>
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
