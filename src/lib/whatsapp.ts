const PHONE = "34660262790";
const BASE_URL = `https://api.whatsapp.com/send?phone=${PHONE}`;

export function buildWhatsAppUrl(message?: string): string {
  if (!message) return BASE_URL;
  return `${BASE_URL}&text=${encodeURIComponent(message)}`;
}

export { PHONE, BASE_URL as WHATSAPP_BASE_URL };
