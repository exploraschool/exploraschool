import { site } from "@/data/site";
import {
  getDisciplineDisplayName,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getBookingItemTitle } from "@/lib/booking-config";
import { media } from "@/lib/media";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

type ReceivedBookingItem = {
  productId?: string;
  date?: string;
  timeSlotId?: string;
  timeSlotLabel?: string;
  participants?: number;
  discipline?: string;
  modality?: string;
  instructorName?: string;
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

function productTitle(productId: string | undefined, isEn: boolean, timeSlotId?: string): string {
  return getBookingItemTitle(productId, isEn ? "en" : "es", timeSlotId);
}

function resolveLogoUrl(siteUrl: string): string {
  const base = (siteUrl || PRODUCTION_SITE_URL).replace(/\/$/, "");
  return `${base}${media.logoEmail}`;
}

export function buildCustomerBookingReceivedEmail({
  data,
  siteUrl,
}: BuildParams): { subject: string; text: string; html: string } {
  const isEn = data.locale === "en";
  const name = String(data.name ?? "").trim();
  const greetingName = firstName(name) || name;
  const items = Array.isArray(data.bookingItems)
    ? (data.bookingItems as ReceivedBookingItem[])
    : [];
  const estimatedTotal =
    typeof data.estimatedTotal === "number" ? data.estimatedTotal : undefined;
  const logoUrl = resolveLogoUrl(siteUrl);
  const baseUrl = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;

  const subject = pick(
    isEn,
    "Solicitud de reserva recibida — Explora School & Club",
    "Booking request received — Explora School & Club",
  );

  const preheader = pick(
    isEn,
    "Hemos recibido tu solicitud. Te responderemos lo antes posible.",
    "We have received your request. We will get back to you as soon as possible.",
  );

  const greeting = pick(
    isEn,
    greetingName ? `Hola ${greetingName},` : "Hola,",
    greetingName ? `Hello ${greetingName},` : "Hello,",
  );

  const thanks = pick(
    isEn,
    "Gracias por tu solicitud de reserva en Explora School & Club. Confirmamos que hemos recibido tu email correctamente.",
    "Thank you for your booking request with Explora School & Club. We confirm that we have received your email.",
  );

  const next = pick(
    isEn,
    "Nuestro equipo la revisará y te responderá lo antes posible para confirmar disponibilidad y los siguientes pasos.",
    "Our team will review it and get back to you as soon as possible to confirm availability and the next steps.",
  );

  const notConfirmed = pick(
    isEn,
    "Este mensaje es un acuse de recibo: la reserva aún no está confirmada.",
    "This message is an acknowledgement only: the booking is not yet confirmed.",
  );

  const totalNote = pick(
    isEn,
    "Total (IVA incl.). Precio de la reserva.",
    "Total (VAT incl.). Booking price.",
  );

  const summaryLines = items.map((item, index) => {
    const discipline = getDisciplineDisplayName(
      isEn ? "en" : "es",
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    );
    return [
      `${index + 1}. ${productTitle(item.productId, isEn, item.timeSlotId)}`,
      discipline ? `   ${pick(isEn, "Disciplina", "Discipline")}: ${discipline}` : "",
      `   ${pick(isEn, "Fecha", "Date")}: ${item.date ? formatDate(item.date, isEn) : "—"}`,
      `   ${pick(isEn, "Horario", "Schedule")}: ${item.timeSlotLabel?.trim() || "—"}`,
      item.participants
        ? `   ${pick(isEn, "Personas", "People")}: ${item.participants}`
        : "",
      item.instructorName?.trim()
        ? `   ${pick(isEn, "Monitor/a preferido/a", "Preferred instructor")}: ${item.instructorName.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const text = [
    greeting,
    "",
    thanks,
    next,
    "",
    notConfirmed,
    "",
    items.length > 0 ? pick(isEn, "Resumen de la solicitud:", "Request summary:") : "",
    ...summaryLines,
    "",
    estimatedTotal !== undefined
      ? `${pick(isEn, "Total", "Total")}: ${estimatedTotal} €`
      : "",
    estimatedTotal !== undefined ? totalNote : "",
    "",
    pick(isEn, "Contacto:", "Contact:"),
    site.email,
    site.phoneDisplay,
    site.whatsappUrl,
    "",
    "Explora School & Club",
    "Sierra Nevada · Granada",
    baseUrl,
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
      const details = [
        discipline,
        item.date ? formatDate(item.date, isEn) : "",
        item.timeSlotLabel?.trim() || "",
        item.participants
          ? pick(
              isEn,
              `${item.participants} ${item.participants === 1 ? "persona" : "personas"}`,
              `${item.participants} ${item.participants === 1 ? "person" : "people"}`,
            )
          : "",
        item.instructorName?.trim() || "",
      ].filter(Boolean);

      return `
        <tr>
          <td style="padding:14px 16px;border-top:${index === 0 ? "0" : `1px solid ${BRAND.border}`};">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.pizarra};">${escapeHtml(productTitle(item.productId, isEn, item.timeSlotId))}</p>
            <p style="margin:0;font-size:13px;line-height:1.45;color:${BRAND.muted};">${escapeHtml(details.join(" · "))}</p>
          </td>
        </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
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
                ${escapeHtml(pick(isEn, "Solicitud recibida", "Request received"))}
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
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(next)}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">
                    ${escapeHtml(notConfirmed)}
                  </td>
                </tr>
              </table>

              ${
                items.length > 0
                  ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">${escapeHtml(pick(isEn, "Resumen de la solicitud", "Request summary"))}</p>
                     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">${sessionHtml}</table>`
                  : ""
              }

              ${
                estimatedTotal !== undefined
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;border-top:1px solid ${BRAND.border};">
                      <tr>
                        <td style="padding:18px 0 4px;font-size:15px;color:${BRAND.pizarra};font-weight:700;">
                          ${escapeHtml(pick(isEn, "Total", "Total"))}
                        </td>
                        <td align="right" style="padding:18px 0 4px;font-size:20px;color:${BRAND.hielo};font-weight:700;">
                          ${escapeHtml(`${estimatedTotal} €`)}
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

              <p style="margin:28px 0 12px;font-size:15px;line-height:1.55;color:${BRAND.pizarra};">
                ${escapeHtml(
                  pick(
                    isEn,
                    "Si necesitas añadir algún detalle, responde a este correo o escríbenos por WhatsApp.",
                    "If you need to add any details, reply to this email or write to us on WhatsApp.",
                  ),
                )}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td style="border-radius:999px;background:${BRAND.accent};">
                    <a href="${escapeHtml(site.whatsappUrl)}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.white};text-decoration:none;">
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
