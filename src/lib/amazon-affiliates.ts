export const AMAZON_ASSOCIATE_TAG =
  process.env.AMAZON_ASSOCIATE_TAG?.trim() || "explorashop08-21";

export const AMAZON_MARKETPLACE_HOST =
  process.env.AMAZON_MARKETPLACE?.trim() || "www.amazon.es";

const ASIN_RE = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/d\/)([A-Z0-9]{10})(?:[/?]|$)/i;
const ASIN_QUERY_RE = /[?&](?:asin|ASIN)=([A-Z0-9]{10})/i;

export function extractAmazonAsin(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    const fromPath = url.pathname.match(ASIN_RE);
    if (fromPath?.[1]) return fromPath[1].toUpperCase();
    const fromQuery = `${url.search}${url.hash}`.match(ASIN_QUERY_RE);
    if (fromQuery?.[1]) return fromQuery[1].toUpperCase();
    return null;
  } catch {
    const fallback = rawUrl.match(ASIN_RE);
    return fallback?.[1]?.toUpperCase() ?? null;
  }
}

export function isAmazonProductUrl(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl.trim()).hostname.toLowerCase();
    return host === "amazon.es" || host.endsWith(".amazon.es") || host.includes("amazon.");
  } catch {
    return false;
  }
}

export function affiliateUrlForAsin(asin: string): string {
  return `https://${AMAZON_MARKETPLACE_HOST}/dp/${asin.toUpperCase()}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

export function toExploraAffiliateUrl(rawUrl: string): string | null {
  const asin = extractAmazonAsin(rawUrl);
  if (!asin) return null;
  return affiliateUrlForAsin(asin);
}

export function isAmazonImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "m.media-amazon.com" ||
    host.endsWith(".ssl-images-amazon.com") ||
    host === "images-na.ssl-images-amazon.com" ||
    host === "images-eu.ssl-images-amazon.com" ||
    host.endsWith(".media-amazon.com")
  );
}

export function isAmazonCdnImageUrl(rawUrl: string): boolean {
  try {
    return isAmazonImageHost(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}
