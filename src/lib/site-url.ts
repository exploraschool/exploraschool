/** Production domain — override with NEXT_PUBLIC_SITE_URL in Vercel if needed. */
export const PRODUCTION_SITE_URL = "https://www.explora-school.es";

/** Public site URL for metadata, canonical links, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV !== "development") {
    return PRODUCTION_SITE_URL;
  }

  return "http://localhost:3000";
}
