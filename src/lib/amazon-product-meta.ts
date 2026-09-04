import * as cheerio from "cheerio";
import {
  extractAmazonAsin,
  isAmazonCdnImageUrl,
  toExploraAffiliateUrl,
} from "@/lib/amazon-affiliates";

export type AmazonProductMeta = {
  url: string;
  asin: string;
  title: string;
  image: string;
  priceText: string;
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

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

export async function fetchAmazonProductMeta(rawUrl: string): Promise<AmazonProductMeta> {
  const affiliateUrl = toExploraAffiliateUrl(rawUrl) || rawUrl.trim();
  const asin = extractAmazonAsin(affiliateUrl) || "";
  const meta: AmazonProductMeta = {
    url: affiliateUrl,
    asin,
    title: "",
    image: "",
    priceText: "",
  };

  try {
    const res = await fetch(affiliateUrl, {
      headers: FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return meta;
    const html = await res.text();
    const $ = cheerio.load(html);
    meta.title =
      pickMeta($, ["og:title", "twitter:title"]) ||
      $("#productTitle").text().trim() ||
      $("title").text().trim();
    const image = pickMeta($, ["og:image", "twitter:image"]);
    if (image && (isAmazonCdnImageUrl(image) || image.startsWith("https://"))) {
      meta.image = image.split("?")[0] || image;
    }
    const price =
      $(".a-price .a-offscreen").first().text().trim() ||
      $("#priceblock_ourprice").text().trim() ||
      pickMeta($, ["product:price:amount"]);
    meta.priceText = price.slice(0, 40);
  } catch (error) {
    console.warn("[amazon-meta] fetch failed:", error);
  }

  return meta;
}
