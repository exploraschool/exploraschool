/** Production domain — set NEXT_PUBLIC_SITE_URL when ready to go live. */
export const PRODUCTION_SITE_URL = "https://www.sierranevadaclases.es";

/** Public site URL for metadata, canonical links, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
