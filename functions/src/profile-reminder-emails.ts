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

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function pick(isEn: boolean, es: string, en: string): string {
  return isEn ? en : es;
}

type BookingItem = {
  productId?: string;
  date?: string;
  timeSlotLabel?: string;
  discipline?: string;
};

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

function sessionsSummary(items: BookingItem[], isEn: boolean): string {
  if (!items.length) return pick(isEn, "Sin sesiones en la reserva", "No sessions on the booking");
  return items
    .map((item, index) => {
      const bits = [
        item.date ? formatDate(item.date, isEn) : null,
        item.timeSlotLabel || null,
        item.discipline || null,
      ].filter(Boolean);
      return `${index + 1}. ${bits.join(" · ") || item.productId || "Clase"}`;
    })
    .join("\n");
}

export type ProfileReminderContext = {
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  locale?: string;
  studentUid?: string | null;
  reason: string;
  bookingItems?: BookingItem[];
  siteUrl: string;
};

export function buildTeamProfileReminderEmail(
  ctx: ProfileReminderContext,
): { subject: string; text: string; html: string } {
  const baseUrl = ctx.siteUrl.replace(/\/$/, "") || "https://www.explora-school.es";
  const logoUrl = `${baseUrl}/images/logo-email.png`;
  const adminUrl = ctx.studentUid
    ? `${baseUrl}/admin/alumnos/${encodeURIComponent(ctx.studentUid)}`
    : `${baseUrl}/admin/reservas`;
  const name = ctx.name.trim() || ctx.email;
  const sessions = sessionsSummary(ctx.bookingItems ?? [], false);

  const subject = `Ficha incompleta: ${name} — recordatorio alumno mañana`;
  const preheader =
    "Mañana enviaremos el recordatorio automático al alumno si sigue sin completar su ficha.";

  const text = [
    "Aviso interno Explora",
    "",
    `${name} (${ctx.email}) aún no ha completado / actualizado su ficha de alumno.`,
    `Motivo: ${ctx.reason}`,
    ctx.phone ? `Teléfono: ${ctx.phone}` : "",
    "",
    "Sesiones:",
    sessions,
    "",
    `Lead: ${ctx.leadId}`,
    adminUrl,
    "",
    "Mañana se enviará el recordatorio automático al alumno si la ficha sigue incompleta.",
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
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.nieve};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.nieve};padding:24px 28px 16px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="64" height="64" alt="Explora" style="display:block;margin:0 auto 10px;border:0;" />
              <p style="margin:0 0 8px;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#fff3f0;color:${BRAND.accent};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                  Aviso interno
                </span>
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                Ficha de alumno incompleta
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">
                <strong>${escapeHtml(name)}</strong> (${escapeHtml(ctx.email)}) aún no ha completado o actualizado su ficha.
              </p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:${BRAND.muted};">
                Motivo: ${escapeHtml(ctx.reason)}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Reserva</p>
                    <p style="margin:0;font-size:14px;line-height:1.55;color:${BRAND.pizarra};white-space:pre-line;">${escapeHtml(sessions)}</p>
                    ${ctx.phone ? `<p style="margin:12px 0 0;font-size:14px;color:${BRAND.pizarra};">Tel: ${escapeHtml(ctx.phone)}</p>` : ""}
                    <p style="margin:12px 0 0;font-size:12px;color:${BRAND.muted};">Lead ${escapeHtml(ctx.leadId)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 22px;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">
                <strong>Mañana</strong> se enviará el recordatorio automático al alumno si la ficha sigue incompleta. Puedes contactarle antes si quieres.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:14px 28px;background:${BRAND.hielo};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;">
                      Abrir en admin
                    </a>
                  </td>
                </tr>
              </table>
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

export function buildStudentProfileReminderEmail(
  ctx: ProfileReminderContext,
): { subject: string; text: string; html: string } {
  const isEn = ctx.locale === "en";
  const baseUrl = ctx.siteUrl.replace(/\/$/, "") || "https://www.explora-school.es";
  const logoUrl = `${baseUrl}/images/logo-email.png`;
  const accountUrl = `${baseUrl}/${isEn ? "en" : "es"}/cuenta`;
  const name = ctx.name.trim();
  const greetingName = firstName(name) || name;
  const sessions = sessionsSummary(ctx.bookingItems ?? [], isEn);

  const subject = pick(
    isEn,
    "Completa tu ficha de alumno — Explora School & Club",
    "Complete your student profile — Explora School & Club",
  );
  const preheader = pick(
    isEn,
    "Revisa tu perfil: nivel, material y datos ayudan a preparar tu clase.",
    "Check your profile: level, gear and details help us prepare your lesson.",
  );
  const greeting = pick(
    isEn,
    greetingName ? `Hola ${greetingName},` : "Hola,",
    greetingName ? `Hello ${greetingName},` : "Hello,",
  );
  const intro = pick(
    isEn,
    "Hace un par de días reservaste clase con nosotros. Todavía no has completado tu ficha de alumno en la cuenta Explora.",
    "A couple of days ago you booked a lesson with us. You still haven’t completed your student profile in your Explora account.",
  );
  const why = pick(
    isEn,
    "Completarla nos ayuda a asignarte mejor el material, el nivel y el monitor. Solo te lleva unos minutos.",
    "Completing it helps us match gear, level and instructor. It only takes a few minutes.",
  );
  const cta = pick(isEn, "Completar mi ficha", "Complete my profile");

  const text = [
    greeting,
    "",
    intro,
    why,
    "",
    pick(isEn, "Tu reserva:", "Your booking:"),
    sessions,
    "",
    accountUrl,
    "",
    "Explora School & Club · Sierra Nevada",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.nieve};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.nieve};padding:28px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Explora School & Club" style="display:block;margin:0 auto 12px;border:0;" />
              <p style="margin:0 0 8px;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e8f4f2;color:${BRAND.hielo};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                  ${escapeHtml(pick(isEn, "Recordatorio", "Reminder"))}
                </span>
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                ${escapeHtml(pick(isEn, "Tu ficha de alumno", "Your student profile"))}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND.hielo};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:${BRAND.pizarra};">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(intro)}</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(why)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">
                      ${escapeHtml(pick(isEn, "Tu reserva", "Your booking"))}
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.55;color:${BRAND.pizarra};white-space:pre-line;">${escapeHtml(sessions)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(accountUrl)}" style="display:inline-block;padding:14px 28px;background:${BRAND.hielo};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;">
                      ${escapeHtml(cta)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                ${escapeHtml(pick(isEn, "Si el botón no funciona, copia este enlace:", "If the button doesn’t work, copy this link:"))}<br />
                <a href="${escapeHtml(accountUrl)}" style="color:${BRAND.hielo};text-decoration:underline;word-break:break-all;">${escapeHtml(accountUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.nieve};font-family:Arial,Helvetica,sans-serif;text-align:center;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${BRAND.pizarra};">Explora School &amp; Club</p>
              <p style="margin:0;font-size:13px;color:${BRAND.muted};">Sierra Nevada · Granada</p>
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
