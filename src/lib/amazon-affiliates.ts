export const AMAZON_ASSOCIATE_TAG =
  process.env.AMAZON_ASSOCIATE_TAG?.trim() || "explorashop08-21";

export const AMAZON_MARKETPLACE_HOST =
  process.env.AMAZON_MARKETPLACE?.trim() || "www.amazon.es";

const ASIN_RE = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/d\/)([A-Z0-9]{10})(?:[/?]|$)/i;
const ASIN_QUERY_RE = /[?&](?:asin|ASIN)=([A-Z0-9]{10})/i;
const SHORT_HOSTS = new Set(["amzn.to", "amzn.eu", "a.co"]);

const RESOLVE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function hostnameOf(rawUrl: string): string {
  try {
    return new URL(rawUrl.trim()).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function normalizeAmazonInput(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(amzn\.to|amzn\.eu|a\.co|www\.amazon\.|amazon\.)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isAmazonShortUrl(rawUrl: string): boolean {
  const host = hostnameOf(normalizeAmazonInput(rawUrl)).replace(/^www\./, "");
  return SHORT_HOSTS.has(host);
}

export function extractAmazonAsin(rawUrl: string): string | null {
  try {
    const url = new URL(normalizeAmazonInput(rawUrl));
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
  const host = hostnameOf(normalizeAmazonInput(rawUrl));
  if (!host) return false;
  const bare = host.replace(/^www\./, "");
  if (SHORT_HOSTS.has(bare)) return true;
  return host === "amazon.es" || host.endsWith(".amazon.es") || host.includes("amazon.");
}

export function affiliateUrlForAsin(asin: string): string {
  return `https://${AMAZON_MARKETPLACE_HOST}/dp/${asin.toUpperCase()}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

export function toExploraAffiliateUrl(rawUrl: string): string | null {
  const asin = extractAmazonAsin(normalizeAmazonInput(rawUrl));
  if (!asin) return null;
  return affiliateUrlForAsin(asin);
}

function isFollowableAmazonUrl(rawUrl: string): boolean {
  const host = hostnameOf(rawUrl).replace(/^www\./, "");
  if (!host) return false;
  if (SHORT_HOSTS.has(host)) return true;
  return host === "amazon.es" || host.endsWith(".amazon.es") || /(^|\.)amazon\.[a-z.]+$/.test(host);
}

async function followAmazonShortUrl(rawUrl: string): Promise<string | null> {
  let current = normalizeAmazonInput(rawUrl);
  for (let hop = 0; hop < 8; hop += 1) {
    if (!isFollowableAmazonUrl(current)) return null;
    const asin = extractAmazonAsin(current);
    if (asin) return current;

    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: RESOLVE_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      return null;
    }

    const location = res.headers.get("location");
    if (location && res.status >= 300 && res.status < 400) {
      current = new URL(location, current).toString();
      continue;
    }
    if (res.url && res.url !== current && isFollowableAmazonUrl(res.url)) {
      current = res.url;
      if (extractAmazonAsin(current)) return current;
      continue;
    }
    if (!res.ok) return null;
    const html = await res.text();
    const canonical =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ||
      html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ||
      "";
    if (canonical) {
      const resolved = new URL(canonical, current).toString();
      if (extractAmazonAsin(resolved)) return resolved;
    }
    const fromHtml = html.match(ASIN_RE)?.[1];
    return fromHtml ? affiliateUrlForAsin(fromHtml) : null;
  }
  return extractAmazonAsin(current) ? current : null;
}

export async function resolveExploraAffiliateUrl(rawUrl: string): Promise<string | null> {
  const direct = toExploraAffiliateUrl(rawUrl);
  if (direct) return direct;
  if (!isAmazonShortUrl(rawUrl) && !isAmazonProductUrl(rawUrl)) return null;
  const target = await followAmazonShortUrl(rawUrl);
  if (!target) return null;
  return toExploraAffiliateUrl(target);
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
