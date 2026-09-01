#!/usr/bin/env node
/**
 * FASE 0 — Scrape legacy WordPress (archivo histórico; dominio antiguo ya no en uso)
 * Live first, Wayback Machine fallback.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML_DIR = path.join(ROOT, "legacy", "html");
const IMAGES_DIR = path.join(ROOT, "public", "images", "legacy");
const BASE = "https://www.sierranevadaclases.es";

const WAYBACK_SNAPSHOTS = {
  "/": "20221002201700",
  "/reserva-clases/": "20221002201700",
  "/nuestro-equipo/": "20220817002655",
  "/blog/": "20221002201700",
  "/contacto/": "20221002201048",
  "/preguntas-frecuentes/": "20221002183458",
  "/politica-de-privacidad/": "20221002201700",
  "/club-explora-en-sierra-nevada/": "20221002201700",
  "/category/recomendaciones/": "20221002201700",
  "/servicios/": "20221002193329",
  "/tarifas/": "20220817010230",
};

const CORE_PATHS = [
  "/",
  "/reserva-clases/",
  "/nuestro-equipo/",
  "/blog/",
  "/contacto/",
  "/preguntas-frecuentes/",
  "/politica-de-privacidad/",
  "/club-explora-en-sierra-nevada/",
  "/category/recomendaciones/",
  "/servicios/",
  "/tarifas/",
  "/sitemap.xml",
  "/wp-sitemap.xml",
];

const BLOG_PATHS = [
  "/guia-de-regalos/",
  "/guia-completa-de-material-de-alta-montana-crampones-mochilas-palas/",
  "/arva-pack-safety-box-evo4-seguridad-y-prevencion-en-la-nieve/",
  "/bastones-de-esqui-2025/",
  "/equipamiento-de-aventura-para-ninos/",
  "/las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada/",
  "/los-10-mejores-guantes-para-esquiar/",
  "/las-5-mejores-cremas-protectoras/",
  "/mejores-cascos-para-esqui-y-snowboard/",
  "/los-5-mejores-relojes-para-esqui-y-snowboard-en-2025/",
  "/las-mejores-chaquetas-de-esqui-y-snowboard-para-hombre-en-2025-guia-de-compra-completa/",
  "/por-que-es-necesario-contratar-clases-de-esqui-o-snowboard/",
  "/como-aprovechar-al-maximo-tu-tiempo-en-las-pistas-de-sierra-nevada-y-evitar-las-colas/",
  "/guia-completa-sobre-los-diferentes-tipos-de-esquis-y-cual-elegir-2025/",
  "/colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos/",
  "/mejora-tu-tecnica-de-snowboard-y-el-equipamiento-que-necesitas-2025/",
  "/aprende-a-esquiar-y-hacer-snowboard-con-explora-school-club-en-sierra-nevada/",
  "/los-mejores-accesorios-para-snowboard-en-2025-guia-completa/",
  "/los-mejores-guantes-para-esqui-y-snowboard-hestra-heli-ski/",
  "/10-trucos-secretos-para-dominar-el-snowboard-en-sierra-nevada-que-ni-los-expertos-conocen/",
  "/los-diferentes-tipos-de-tablas-de-snowboard-cual-es-la-ideal-para-ti-2025/",
  "/como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada/",
  "/plano-de-pistas-de-sierra-nevada/",
  "/gafas-fotocromaticas-para-deportes-de-nieve-y-montana-2025/",
  "/5-mejores-opciones-de-protector-labial/",
  "/guia-completa-sobre-cadenas-de-nieve-2025-seguridad-y-traccion/",
];

const SKIP_IMAGE_PATTERNS = [
  /gravatar\.com/i,
  /google-analytics/i,
  /googletagmanager/i,
  /facebook\.com\/tr/i,
  /doubleclick/i,
  /pixel\./i,
  /wp\.com\/pixel/i,
  /stats\.wp\.com/i,
  /1x1\./i,
  /spacer\.gif/i,
  /data:image\/svg/i,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugFromPath(p) {
  if (p === "/") return "home";
  if (p.endsWith(".xml")) return p.replace(/\//g, "-").replace(/^-|-$/g, "");
  return p.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
}

function resolveUrl(href, pageUrl) {
  if (!href || href.startsWith("data:") || href.startsWith("javascript:")) return null;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

function isSkippableImage(url) {
  return SKIP_IMAGE_PATTERNS.some((re) => re.test(url));
}

function semanticName(url, alt, page) {
  const u = url.toLowerCase();
  const a = (alt || "").toLowerCase();

  const hints = [
    ["logo", /logo|explora.*school|brand/i],
    ["hero-sierra-nevada", /hero|banner|header.*bg|slider|portada/i],
    ["instructor-reche", /reche/i],
    ["instructor-patri", /patri/i],
    ["instructor-lalo", /lalo/i],
    ["instructor-jorge", /jorge/i],
    ["instructor-esau", /esa[uú]/i],
    ["instructor-aitana", /aitana/i],
    ["instructor-estrella", /estrella/i],
    ["instructor-ale", /\bale\b/i],
    ["instructor-benja", /benja/i],
    ["instructor-ferran", /ferran/i],
    ["favicon", /favicon|icon/i],
    ["og-image", /og-image|social/i],
    ["pistas-sierra-nevada", /pista|borreguiles|sierra.nevada|veleta|telecabina/i],
    ["clase-esqui", /esqu[ií]|ski/i],
    ["clase-snowboard", /snowboard/i],
    ["clase-telemark", /telemark/i],
  ];

  for (const [name, re] of hints) {
    if (re.test(u) || re.test(a) || re.test(page)) return name;
  }

  const hash = createHash("md5").update(url).digest("hex").slice(0, 8);
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  return `legacy-${hash}${ext}`;
}

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "ExploraSchool-MigrationBot/1.0 (+https://www.sierranevadaclases.es)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      return { status: res.status, body: await res.text(), source: "live", finalUrl: res.url };
    } catch (err) {
      if (i === retries) throw err;
      await sleep(1500);
    }
  }
}

async function fetchWayback(pagePath, snapshot = "20221002201700") {
  const snap = WAYBACK_SNAPSHOTS[pagePath] || snapshot;
  const target = `${BASE}${pagePath}`;
  const waybackUrl = `https://web.archive.org/web/${snap}id_/${target}`;
  const res = await fetch(waybackUrl, {
    headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const alt = `https://web.archive.org/web/2025/${target}`;
    const res2 = await fetch(alt, {
      headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
      signal: AbortSignal.timeout(45000),
    });
    if (!res2.ok) return null;
    return { status: res2.status, body: await res2.text(), source: `wayback-2025`, finalUrl: target };
  }
  return { status: res.status, body: await res.text(), source: `wayback-${snap}`, finalUrl: target };
}

async function fetchPage(pagePath) {
  const liveUrl = `${BASE}${pagePath}`;
  try {
    const live = await fetchWithRetry(liveUrl);
    if (live.status === 200 && live.body.length > 500) {
      return live;
    }
  } catch {
    /* fall through */
  }
  return fetchWayback(pagePath);
}

function extractImages($, pageUrl, pagePath) {
  const found = new Map();

  const add = (src, alt = "") => {
    const resolved = resolveUrl(src, pageUrl);
    if (!resolved || isSkippableImage(resolved)) return;
    if (!found.has(resolved)) found.set(resolved, { alt, page: pagePath });
  };

  $("img").each((_, el) => {
    const $el = $(el);
    add($el.attr("src"), $el.attr("alt") || "");
    const srcset = $el.attr("srcset");
    if (srcset) {
      srcset.split(",").forEach((part) => {
        const u = part.trim().split(/\s+/)[0];
        add(u, $el.attr("alt") || "");
      });
    }
  });

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
    add($(el).attr("content"), "og:image");
  });

  $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((_, el) => {
    add($(el).attr("href"), "favicon");
  });

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const matches = style.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/gi);
    for (const m of matches) add(m[1], "background");
  });

  $("video[poster]").each((_, el) => add($(el).attr("poster"), "video-poster"));

  $("source[srcset], source[src]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset) {
      srcset.split(",").forEach((part) => add(part.trim().split(/\s+/)[0]));
    }
    add($(el).attr("src"));
  });

  return found;
}

function extractContent($, pagePath) {
  $("script, style, noscript, iframe").remove();

  const meta = {
    title: $("title").first().text().trim(),
    description: $('meta[name="description"]').attr("content") || "",
    canonical: $('link[rel="canonical"]').attr("href") || "",
    ogTitle: $('meta[property="og:title"]').attr("content") || "",
    ogDescription: $('meta[property="og:description"]').attr("content") || "",
    ogImage: $('meta[property="og:image"]').attr("content") || "",
  };

  const headings = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) headings.push({ level: el.tagName.toLowerCase(), text });
  });

  const paragraphs = [];
  $("p, li, td, th, blockquote, .elementor-widget-text-editor").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 10) paragraphs.push(text);
  });

  const alts = [];
  $("img[alt]").each((_, el) => {
    const alt = $(el).attr("alt")?.trim();
    if (alt && alt.length > 2) alts.push(alt);
  });

  const internalLinks = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const resolved = resolveUrl(href, `${BASE}${pagePath}`);
    if (resolved && resolved.includes("sierranevadaclases.es")) {
      internalLinks.push({ href: resolved, text: $(el).text().replace(/\s+/g, " ").trim() });
    }
  });

  const tables = [];
  $("table").each((_, table) => {
    const rows = [];
    $(table)
      .find("tr")
      .each((__, tr) => {
        const cells = [];
        $(tr)
          .find("td, th")
          .each((___, cell) => cells.push($(cell).text().replace(/\s+/g, " ").trim()));
        if (cells.length) rows.push(cells);
      });
    if (rows.length) tables.push(rows);
  });

  return { meta, headings, paragraphs, alts, internalLinks, tables };
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    try {
      const u = new URL(m[1]);
      if (u.hostname.includes("sierranevadaclases.es")) {
        urls.push(u.pathname);
      }
    } catch {
      /* skip */
    }
  }
  return urls;
}

const downloadedImages = new Map();
const usedNames = new Set();

async function downloadImage(originalUrl, alt, pagePath) {
  if (downloadedImages.has(originalUrl)) {
    return downloadedImages.get(originalUrl);
  }

  let fetchUrl = originalUrl;
  if (originalUrl.includes("web.archive.org")) {
    /* already wayback */
  } else if (!originalUrl.startsWith("http")) {
    fetchUrl = resolveUrl(originalUrl, `${BASE}${pagePath}`);
  }

  if (!fetchUrl || isSkippableImage(fetchUrl)) return null;

  try {
    const res = await fetch(fetchUrl, {
      headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const wb = `https://web.archive.org/web/20221002201700im_/${originalUrl}`;
      const res2 = await fetch(wb, {
        headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res2.ok) return null;
      const buf = Buffer.from(await res2.arrayBuffer());
      return saveImage(buf, originalUrl, alt, pagePath, res2.headers.get("content-type"));
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return saveImage(buf, originalUrl, alt, pagePath, res.headers.get("content-type"));
  } catch {
    return null;
  }
}

function extFromContentType(ct, url) {
  if (ct?.includes("webp")) return ".webp";
  if (ct?.includes("png")) return ".png";
  if (ct?.includes("svg")) return ".svg";
  if (ct?.includes("gif")) return ".gif";
  if (ct?.includes("jpeg") || ct?.includes("jpg")) return ".jpg";
  const ext = path.extname(new URL(url).pathname);
  return ext || ".jpg";
}

async function saveImage(buf, originalUrl, alt, pagePath, contentType) {
  let baseName = semanticName(originalUrl, alt, pagePath);
  const ext = path.extname(baseName) || extFromContentType(contentType, originalUrl);
  if (!path.extname(baseName)) baseName += ext;

  let finalName = baseName;
  let counter = 1;
  while (usedNames.has(finalName)) {
    const stem = baseName.replace(/\.[^.]+$/, "");
    finalName = `${stem}-${counter}${ext}`;
    counter++;
  }
  usedNames.add(finalName);

  const localPath = path.join("public", "images", "legacy", finalName);
  const absPath = path.join(ROOT, localPath);
  await fs.writeFile(absPath, buf);

  const entry = {
    originalUrl,
    localPath: `/images/legacy/${finalName}`,
    alt: alt || "",
    page: pagePath,
    width: null,
    height: null,
    sizeBytes: buf.length,
  };
  downloadedImages.set(originalUrl, entry);
  return entry;
}

async function main() {
  console.log("=== FASE 0: Scrape legacy WordPress (archivo) ===\n");

  await fs.mkdir(HTML_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const allPaths = new Set([...CORE_PATHS, ...BLOG_PATHS]);
  const content = {};
  const pageStats = [];

  for (const pagePath of allPaths) {
    const slug = slugFromPath(pagePath);
    console.log(`Fetching ${pagePath} ...`);

    if (pagePath.endsWith(".xml")) {
      try {
        const result = await fetchPage(pagePath);
        if (result) {
          await fs.writeFile(path.join(HTML_DIR, `${slug}.xml`), result.body, "utf8");
          const extra = parseSitemapUrls(result.body);
          extra.forEach((p) => allPaths.add(p));
          pageStats.push({ path: pagePath, source: result.source, status: result.status, images: 0 });
        }
      } catch (e) {
        console.warn(`  ✗ sitemap ${pagePath}: ${e.message}`);
        pageStats.push({ path: pagePath, source: "failed", status: 0, images: 0 });
      }
      await sleep(800);
      continue;
    }

    try {
      const result = await fetchPage(pagePath);
      if (!result) {
        console.warn(`  ✗ No content for ${pagePath}`);
        pageStats.push({ path: pagePath, source: "failed", status: 0, images: 0 });
        continue;
      }

      await fs.writeFile(path.join(HTML_DIR, `${slug}.html`), result.body, "utf8");

      const $ = cheerio.load(result.body);
      const pageUrl = result.finalUrl || `${BASE}${pagePath}`;
      const extracted = extractContent($, pagePath);
      const images = extractImages($, pageUrl, pagePath);

      let imgCount = 0;
      for (const [imgUrl, meta] of images) {
        const saved = await downloadImage(imgUrl, meta.alt, pagePath);
        if (saved) imgCount++;
        await sleep(200);
      }

      content[pagePath] = {
        ...extracted,
        source: result.source,
        fetchedAt: new Date().toISOString(),
        imageCount: imgCount,
      };

      pageStats.push({
        path: pagePath,
        source: result.source,
        status: result.status,
        images: imgCount,
        title: extracted.meta.title,
      });

      console.log(`  ✓ ${result.source} — ${imgCount} images`);
    } catch (e) {
      console.warn(`  ✗ ${pagePath}: ${e.message}`);
      pageStats.push({ path: pagePath, source: "error", status: 0, images: 0, error: e.message });
    }

    await sleep(1000);
  }

  const contentPath = path.join(ROOT, "legacy", "content.json");
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf8");

  const manifest = [...downloadedImages.values()];
  const manifestPath = path.join(ROOT, "legacy", "images-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  const statsPath = path.join(ROOT, "legacy", "scrape-stats.json");
  await fs.writeFile(statsPath, JSON.stringify(pageStats, null, 2), "utf8");

  console.log(`\n=== Done ===`);
  console.log(`Pages: ${pageStats.filter((p) => p.status).length}/${pageStats.length}`);
  console.log(`Images: ${manifest.length}`);
  console.log(`Content: ${contentPath}`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
