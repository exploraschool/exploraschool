import * as cheerio from "cheerio";
import {
  extractAmazonAsin,
  isAmazonCdnImageUrl,
  resolveExploraAffiliateUrl,
  toExploraAffiliateUrl,
} from "@/lib/amazon-affiliates";

export type AmazonSpec = { label: string; value: string };

export type AmazonProductMeta = {
  url: string;
  asin: string;
  title: string;
  brand: string;
  image: string;
  images: string[];
  priceText: string;
  rating: string;
  reviewCount: string;
  bullets: string[];
  description: string;
  specs: AmazonSpec[];
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

const MAX_IMAGES = 8;
const MAX_BULLETS = 12;
const MAX_SPECS = 16;
const MIN_IMAGE_BYTES = 4000;

function pickMeta($: cheerio.CheerioAPI, names: string[]): string {
  for (const name of names) {
    const content =
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content") ||
      "";
    if (content.trim()) return content.trim();
  }
  return "";
}

export function toHiResAmazonImage(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(/(\/images\/[IS]\/[A-Za-z0-9%+-]+)(\._[^/]+)?(\.(jpe?g|png|webp))$/i);
    if (match) {
      url.pathname = `${match[1]}._AC_SL1500_.${match[4].toLowerCase()}`;
      url.search = "";
      return url.toString();
    }
  } catch {
    /* keep original */
  }
  return rawUrl.split("?")[0] || rawUrl;
}

function uniqueImages(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    if (!raw || raw.includes("sprite") || raw.includes("grey-pixel") || raw.includes("play-icon")) {
      continue;
    }
    const upgraded = toHiResAmazonImage(raw);
    const key = upgraded.replace(/\._AC_[^.]+\./, ".");
    if (seen.has(key)) continue;
    if (!isAmazonCdnImageUrl(upgraded) && !upgraded.startsWith("https://")) continue;
    seen.add(key);
    out.push(upgraded);
    if (out.length >= MAX_IMAGES) break;
  }
  return out;
}

function collectScriptImages(html: string): string[] {
  const urls: string[] = [];
  const patterns = [
    /"hiRes"\s*:\s*"(https:\\\/\\\/[^"]+|https:\/\/[^"]+)"/g,
    /'hiRes'\s*:\s*'(https:\\\/\\\/[^']+|https:\/\/[^']+)'/g,
    /"large"\s*:\s*"(https:\\\/\\\/[^"]+|https:\/\/[^"]+)"/g,
    /'large'\s*:\s*'(https:\\\/\\\/[^']+|https:\/\/[^']+)'/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      urls.push(match[1].replace(/\\\//g, "/"));
    }
  }
  const landing = html.matchAll(
    /https:\/\/m\.media-amazon\.com\/images\/[IS]\/[A-Za-z0-9+_%.-]+\.(?:jpe?g|png|webp)/gi,
  );
  for (const match of landing) {
    urls.push(match[0]);
  }
  const ids = html.matchAll(/\/images\/I\/([A-Za-z0-9+_-]{10,})/g);
  for (const match of ids) {
    urls.push(`https://m.media-amazon.com/images/I/${match[1]}._AC_SL1500_.jpg`);
  }
  return urls;
}

async function imageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(6000) });
    if (!res.ok) return false;
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (!type.includes("jpeg") && !type.includes("jpg") && !type.includes("png") && !type.includes("webp")) {
      return false;
    }
    const length = Number(res.headers.get("content-length") || 0);
    return length === 0 || length >= MIN_IMAGE_BYTES;
  } catch {
    return false;
  }
}

export async function fetchAmazonImagesByAsin(asin: string, limit = MAX_IMAGES): Promise<string[]> {
  if (!asin) return [];
  const candidates = [
    `https://m.media-amazon.com/images/P/${asin}.01.MAIN._SCRM_.jpg`,
    ...Array.from({ length: 12 }, (_, index) => {
      const n = String(index + 1).padStart(2, "0");
      return `https://m.media-amazon.com/images/P/${asin}.01.PT${n}._SCRM_.jpg`;
    }),
    `https://m.media-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
  ];
  const checks = await Promise.all(
    candidates.map(async (url) => ({ url, ok: await imageExists(url) })),
  );
  return uniqueImages(checks.filter((item) => item.ok).map((item) => item.url)).slice(0, limit);
}

async function fetchAmazonHtml(asin: string): Promise<string> {
  const headers = FETCH_HEADERS;
  const urls = [
    `https://www.amazon.es/dp/${asin}`,
    `https://www.amazon.es/gp/aw/d/${asin}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.length < 8000) continue;
      if (/captcha|robot check/i.test(html.slice(0, 4000))) continue;
      return html;
    } catch {
      /* try next */
    }
  }
  return "";
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").replace("Leer más", "").trim();
}

export function formatAmazonBrief(meta: AmazonProductMeta): string {
  const specLines = meta.specs.map((spec) => `- ${spec.label}: ${spec.value}`).join("\n");
  const bullets = meta.bullets.map((item) => `- ${item}`).join("\n");
  return [
    `ASIN: ${meta.asin || "(desconocido)"}`,
    `Título Amazon: ${meta.title || "(no disponible)"}`,
    `Marca: ${meta.brand || "(no disponible)"}`,
    `Precio visible: ${meta.priceText || "(no inventar si vacío)"}`,
    `Valoración: ${meta.rating || "(no inventar)"}`,
    `Opiniones: ${meta.reviewCount || "(no inventar)"}`,
    `Fotos de galería: ${meta.images.length}`,
    bullets ? `Características Amazon:\n${bullets}` : "Características Amazon: (no disponibles)",
    specLines ? `Ficha técnica:\n${specLines}` : "Ficha técnica: (no disponible)",
    meta.description ? `Descripción Amazon:\n${meta.description.slice(0, 1200)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function fetchAmazonProductMeta(rawUrl: string): Promise<AmazonProductMeta> {
  const affiliateUrl =
    (await resolveExploraAffiliateUrl(rawUrl)) || toExploraAffiliateUrl(rawUrl) || rawUrl.trim();
  const asin = extractAmazonAsin(affiliateUrl) || "";
  const meta: AmazonProductMeta = {
    url: affiliateUrl,
    asin,
    title: "",
    brand: "",
    image: "",
    images: [],
    priceText: "",
    rating: "",
    reviewCount: "",
    bullets: [],
    description: "",
    specs: [],
  };

  const [html, cdnImages] = await Promise.all([
    asin ? fetchAmazonHtml(asin) : Promise.resolve(""),
    asin ? fetchAmazonImagesByAsin(asin, MAX_IMAGES) : Promise.resolve([] as string[]),
  ]);

  if (html) {
    try {
      const $ = cheerio.load(html);

      meta.title =
        pickMeta($, ["og:title", "twitter:title"]) ||
        $("#productTitle").text().trim() ||
        $("title").first().text().trim();
      meta.brand =
        $("#bylineInfo").text().replace(/visita la tienda de|marca:|brand:/gi, "").trim() ||
        $("a#bylineInfo").text().trim() ||
        $("#brand").text().trim();

      const ogImage = pickMeta($, ["og:image", "twitter:image"]);
      const landing =
        $("#landingImage").attr("data-old-hires") ||
        $("#landingImage").attr("src") ||
        $("#imgBlkFront").attr("src") ||
        "";
      const dynamic: string[] = [];
      $("[data-a-dynamic-image]").each((_, el) => {
        const raw = $(el).attr("data-a-dynamic-image") || "";
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          dynamic.push(...Object.keys(parsed));
        } catch {
          /* ignore */
        }
      });
      $("#altImages img, #imageBlock img, #main-image-container img").each((_, el) => {
        const src = $(el).attr("data-old-hires") || $(el).attr("data-src") || $(el).attr("src") || "";
        if (src.startsWith("http")) dynamic.push(src);
      });

      meta.images = uniqueImages([
        ...cdnImages,
        ogImage,
        landing,
        ...dynamic,
        ...collectScriptImages(html),
      ]);

      const price =
        $(".a-price .a-offscreen").first().text().trim() ||
        $("#priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice").first().text().trim() ||
        pickMeta($, ["product:price:amount"]);
      meta.priceText = price.slice(0, 48);

      meta.rating =
        $("#acrPopover").attr("title") ||
        $("span[data-hook='rating-out-of-text']").first().text().trim() ||
        $("i.a-icon-star span").first().text().trim();
      meta.reviewCount =
        $("#acrCustomerReviewText").first().text().trim() ||
        $("span[data-hook='total-review-count']").first().text().trim();

      const bullets = new Set<string>();
      $("#feature-bullets li, #featurebullets_feature_div li").each((_, el) => {
        const text = cleanText($(el).text());
        if (text.length > 12 && !/hacer clic|click aquí|ver más/i.test(text)) bullets.add(text);
      });
      meta.bullets = [...bullets].slice(0, MAX_BULLETS);

      meta.description = cleanText(
        $("#productDescription").text() ||
          $("#productDescription_feature_div").text() ||
          $("#aplus").text().slice(0, 1500),
      ).slice(0, 1800);

      const specs: AmazonSpec[] = [];
      $(
        "#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, #prodDetails tr, table.a-keyvalue tr",
      ).each((_, el) => {
        const label = cleanText($(el).find("th").first().text());
        const value = cleanText($(el).find("td").first().text());
        if (label && value && label.length < 80 && value.length < 160) {
          specs.push({ label, value });
        }
      });
      $("#detailBullets_feature_div li").each((_, el) => {
        const label = cleanText($(el).find(".a-text-bold").first().text().replace(":", ""));
        const value = cleanText($(el).clone().children().remove().end().text());
        if (label && value) specs.push({ label, value });
      });
      const seenSpec = new Set<string>();
      meta.specs = specs.filter((spec) => {
        const key = spec.label.toLowerCase();
        if (seenSpec.has(key)) return false;
        seenSpec.add(key);
        return true;
      }).slice(0, MAX_SPECS);
    } catch (error) {
      console.warn("[amazon-meta] parse failed:", error);
    }
  }

  if (!meta.images.length) {
    meta.images = uniqueImages(cdnImages);
  }
  meta.image = meta.images[0] || "";

  return meta;
}
