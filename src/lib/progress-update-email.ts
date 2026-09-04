import { progressDisciplineName, type ProgressDisciplineId } from "@/data/progress-skills";
import { media } from "@/lib/media";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import type { ProgressReport } from "@/lib/progress-reports";

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

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function resolveLogoUrl(siteUrl: string): string {
  const base = (siteUrl || PRODUCTION_SITE_URL).replace(/\/$/, "");
  return `${base}${media.logoEmail}`;
}

type BuildParams = {
  report: ProgressReport;
  siteUrl: string;
  isNew?: boolean;
};

export function buildProgressUpdateEmail({
  report,
  siteUrl,
  isNew = false,
}: BuildParams): { subject: string; text: string; html: string } {
  const baseUrl = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;
  const logoUrl = resolveLogoUrl(baseUrl);
  const accountUrl = `${baseUrl}/es/cuenta#progreso`;
  const name = report.studentName?.trim() || "";
  const greetingName = firstName(name) || name;
  const instructor = report.instructorName?.trim() || "tu monitor/a";
  const discipline = progressDisciplineName(
    report.discipline as ProgressDisciplineId,
    "es",
  );
  const focus = report.nextFocus?.trim() || "";
  const notesPreview = report.notes?.trim()
    ? report.notes.trim().length > 180
      ? `${report.notes.trim().slice(0, 177)}…`
      : report.notes.trim()
    : "";

  const subject = isNew
    ? "Nueva ficha de progreso — Explora School & Club"
    : "Tu ficha de progreso se ha actualizado — Explora School & Club";

  const preheader = isNew
    ? `${instructor} ha publicado una nueva ficha. Entra en tu cuenta para verla.`
    : `${instructor} ha actualizado tu ficha. Entra en tu cuenta para ver los cambios.`;

  const greeting = greetingName ? `Hola ${greetingName},` : "Hola,";
  const intro = isNew
    ? `${instructor} ha publicado una nueva ficha de progreso de tu clase de ${discipline}.`
    : `${instructor} ha actualizado tu ficha de progreso de ${discipline}.`;
  const invite =
    "Entra en tu área de alumno para ver tips, el próximo foco y la evolución técnica.";

  const text = [
    greeting,
    "",
    intro,
    focus ? `Próximo foco: ${focus}` : "",
    notesPreview ? `Notas: ${notesPreview}` : "",
    "",
    invite,
    accountUrl,
    "",
    "Explora School & Club · Sierra Nevada",
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
            <td style="background:${BRAND.nieve};padding:28px 28px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Explora School & Club" style="display:block;margin:0 auto 12px;border:0;outline:none;" />
              <p style="margin:0 0 8px;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e8f4f2;color:${BRAND.hielo};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                  ${escapeHtml(isNew ? "Nueva ficha" : "Ficha actualizada")}
                </span>
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">
                Tu progreso en Explora
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
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${BRAND.pizarra};">${escapeHtml(invite)}</p>
              ${
                focus
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:#eef8f3;border:1px solid #b9dfcb;border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Próximo foco</p>
                          <p style="margin:0;font-size:15px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(focus)}</p>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
              ${
                notesPreview
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">Notas del monitor</p>
                          <p style="margin:0;font-size:14px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(notesPreview)}</p>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(accountUrl)}" style="display:inline-block;padding:14px 28px;background:${BRAND.hielo};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;">
                      Ver mi ficha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                Si el botón no funciona, copia este enlace:<br />
                <a href="${escapeHtml(accountUrl)}" style="color:${BRAND.hielo};text-decoration:underline;word-break:break-all;">${escapeHtml(accountUrl)}</a>
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
