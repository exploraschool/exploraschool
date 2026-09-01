/** Production domain — override with NEXT_PUBLIC_SITE_URL in Vercel if needed. */
export const PRODUCTION_SITE_URL = "https://www.explora-school.es";

/** Public site URL for metadata, canonical links, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
