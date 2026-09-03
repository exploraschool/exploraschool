import { media } from "@/lib/media";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

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

type ResultKind = "confirm" | "cancel";

type BuildResultPageParams = {
  kind: ResultKind;
  already?: boolean;
  emailSent?: boolean;
  emailError?: string;
  siteUrl?: string;
};

export function buildBookingActionResultHtml({
  kind,
  already = false,
  emailSent = false,
  emailError,
  siteUrl = PRODUCTION_SITE_URL,
}: BuildResultPageParams): string {
  const base = siteUrl.replace(/\/$/, "") || PRODUCTION_SITE_URL;
  const logoUrl = `${base}${media.logoEmail}`;
  const adminUrl = `${base}/admin/reservas`;
  const isConfirm = kind === "confirm";

  const title = already
    ? isConfirm
      ? "Reserva ya confirmada"
      : "Reserva ya rechazada"
    : isConfirm
      ? "Reserva confirmada"
      : "Reserva rechazada";

  const eyebrow = isConfirm ? "Confirmación" : "Rechazo";
  const accent = isConfirm ? BRAND.success : BRAND.accent;
  const softBg = isConfirm ? "#eef8f3" : "#fef2f2";
  const softBorder = isConfirm ? "#b9dfcb" : "#f0c4c5";

  const lead = already
    ? isConfirm
      ? "Esta reserva ya estaba confirmada anteriormente."
      : "Esta reserva ya estaba marcada como rechazada."
    : isConfirm
      ? "Has confirmado la reserva correctamente."
      : "Has rechazado la reserva. El cliente ha sido (o será) informado por email.";

  let emailBlock = "";
  if (!already || emailSent || emailError) {
    if (emailSent) {
      emailBlock = isConfirm
        ? "<p style=\"margin:0;font-size:14px;line-height:1.55;color:#0e0e0f;\">El cliente ha recibido el email de confirmación.</p>"
        : "<p style=\"margin:0;font-size:14px;line-height:1.55;color:#0e0e0f;\">El cliente ha recibido el email de rechazo.</p>";
    } else if (emailError) {
      emailBlock = `<p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#0e0e0f;"><strong>Atención:</strong> la reserva se actualizó, pero el email al cliente no se envió.</p>
        <p style="margin:0;font-size:13px;line-height:1.5;color:#5c5c5e;">${escapeHtml(emailError)}</p>`;
    } else if (!already) {
      emailBlock = `<p style="margin:0;font-size:14px;line-height:1.55;color:#5c5c5e;">No se envió email al cliente. Revisa RESEND_API_KEY y RESEND_FROM en Vercel.</p>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Explora School &amp; Club</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nieve};color:${BRAND.pizarra};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.nieve};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.nieve};padding:28px 24px 18px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Explora School & Club" style="display:block;margin:0 auto 12px;border:0;" />
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.hielo};font-weight:700;">${escapeHtml(eyebrow)}</p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${BRAND.pizarra};font-weight:700;">${escapeHtml(title)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <div style="padding:16px 18px;background:${softBg};border:1px solid ${softBorder};border-radius:14px;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:${BRAND.pizarra};">${escapeHtml(lead)}</p>
              </div>
              ${
                emailBlock
                  ? `<div style="margin-top:16px;padding:16px 18px;background:${BRAND.nieve};border:1px solid ${BRAND.border};border-radius:14px;">${emailBlock}</div>`
                  : ""
              }
              <p style="margin:28px 0 0;text-align:center;">
                <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 22px;background:${BRAND.hielo};color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;">
                  Ir al panel de reservas
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 22px;border-top:1px solid ${BRAND.border};background:${BRAND.nieve};text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">Explora School &amp; Club · Sierra Nevada</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
