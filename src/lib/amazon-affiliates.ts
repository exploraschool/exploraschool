export const AMAZON_ASSOCIATE_TAG =
  process.env.AMAZON_ASSOCIATE_TAG?.trim() || "explorashop08-21";

export const AMAZON_MARKETPLACE_HOST =
  process.env.AMAZON_MARKETPLACE?.trim() || "www.amazon.es";

const ASIN_IN_TEXT_RE =
  /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/exec\/obidos\/ASIN\/|\/o\/ASIN\/|\/product\/)([A-Z0-9]{10})(?![A-Z0-9])/i;
const ASIN_PARAM_RE = /(?:^|[?&#])(?:asin|pd_rd_i|creativeASIN)=([A-Z0-9]{10})(?![A-Z0-9])/i;
const BARE_ASIN_RE = /^(?:B[A-Z0-9]{9}|\d{9}[\dX])$/i;
const SHORT_HOSTS = new Set(["amzn.to", "amzn.eu", "a.co", "link.amazon", "amzlinks.in"]);

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

function stripInvisible(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " ").trim();
}

function decodeRepeated(value: string): string {
  let current = value;
  for (let hop = 0; hop < 2; hop += 1) {
    try {
      const next = decodeURIComponent(current.replace(/\+/g, " "));
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

export function normalizeAmazonInput(rawUrl: string): string {
  const cleaned = stripInvisible(rawUrl);
  if (!cleaned) return cleaned;
  const embedded =
    cleaned.match(/https?:\/\/[^\s<>"']+/i)?.[0] ??
    cleaned.match(/(?:amzn\.to|amzn\.eu|a\.co|link\.amazon|amzlinks\.in|(?:www\.)?amazon\.[a-z.]+)\/[^\s<>"']+/i)?.[0];
  let candidate = (embedded ?? cleaned).replace(/[),.;]+$/g, "").replace(/^<+|>+$/g, "");
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (/^(amzn\.to|amzn\.eu|a\.co|link\.amazon|amzlinks\.in|www\.amazon\.|amazon\.)/i.test(candidate)) {
    return `https://${candidate}`;
  }
  return candidate;
}

export function isAmazonShortUrl(rawUrl: string): boolean {
  const host = hostnameOf(normalizeAmazonInput(rawUrl)).replace(/^www\./, "");
  return SHORT_HOSTS.has(host);
}

function asinIn(value: string, hostIsShort: boolean): string | null {
  if (!hostIsShort) {
    const fromPath = value.match(ASIN_IN_TEXT_RE)?.[1];
    if (fromPath) return fromPath.toUpperCase();
  }
  const fromParam = value.match(ASIN_PARAM_RE)?.[1];
  return fromParam ? fromParam.toUpperCase() : null;
}

export function extractAmazonAsin(rawUrl: string): string | null {
  const normalized = normalizeAmazonInput(rawUrl);
  if (BARE_ASIN_RE.test(normalized)) return normalized.toUpperCase();
  const host = hostnameOf(normalized).replace(/^www\./, "");
  const short = SHORT_HOSTS.has(host);
  const fromNormalized = asinIn(decodeRepeated(normalized), short);
  if (fromNormalized) return fromNormalized;
  if (!short && rawUrl !== normalized) return asinIn(rawUrl, false);
  return null;
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
  if (!isFollowableAmazonUrl(current)) return null;
  for (let hop = 0; hop < 8; hop += 1) {
    const asin = extractAmazonAsin(current);
    if (asin && isAmazonProductUrl(current)) return current;

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
      const next = new URL(location, current).toString();
      if (!next.startsWith("https://")) return null;
      current = next;
      continue;
    }
    if (res.url && res.url !== current && isFollowableAmazonUrl(res.url)) {
      current = res.url;
      if (extractAmazonAsin(current)) return current;
      continue;
    }
    if (!res.ok || !isAmazonProductUrl(res.url || current)) return null;
    const html = await res.text();
    const canonical =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ||
      html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ||
      "";
    if (canonical) {
      const resolved = new URL(canonical, current).toString();
      if (extractAmazonAsin(resolved)) return resolved;
    }
    const fromHtml = extractAmazonAsin(html);
    return fromHtml ? affiliateUrlForAsin(fromHtml) : null;
  }
  return extractAmazonAsin(current) && isAmazonProductUrl(current) ? current : null;
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
