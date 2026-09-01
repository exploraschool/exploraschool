#!/usr/bin/env node
/**
 * Extract & download images from scraped HTML + fetch missing pages via Wayback.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML_DIR = path.join(ROOT, "legacy", "html");
const IMAGES_DIR = path.join(ROOT, "public", "images", "legacy");
const BASE = "https://www.sierranevadaclases.es";

const MISSING_PAGES = [
  { path: "/nuestro-equipo/", snap: "20220817002655", slug: "nuestro-equipo" },
  { path: "/preguntas-frecuentes/", snap: "20221002183458", slug: "preguntas-frecuentes" },
  { path: "/reserva-clases/", snap: "20221002201700", slug: "reserva-clases" },
  { path: "/blog/", snap: "20221002201700", slug: "blog" },
  { path: "/politica-de-privacidad/", snap: "20221002201700", slug: "politica-de-privacidad" },
  { path: "/club-explora-en-sierra-nevada/", snap: "20221002201700", slug: "club-explora" },
];

const SKIP = [/gravatar/i, /pixel/i, /analytics/i, /1x1/i, /\.css/i, /\.js/i, /useanyfont/i];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function semanticName(url) {
  const file = path.basename(new URL(url).pathname);
  const lower = file.toLowerCase();
  const map = {
    "logo-explora": /logo/i,
    "hero-alumnos-instructores": /portada-alumnos|alumnosinstructores/i,
    "clase-snow-grupo": /grupo-ale|grupo.*snow/i,
    "instructor-reche": /reche/i,
    "instructor-patri": /patri/i,
    "instructor-lalo": /lalo/i,
    "instructor-jorge": /jorge/i,
    "instructor-esau": /esau|esaú/i,
    "instructor-aitana": /aitana/i,
    "instructor-estrella": /estrella/i,
    "instructor-ale": /\bale\b/i,
    "instructor-benja": /benja/i,
    "instructor-ferran": /ferran/i,
    "pistas-sierra-nevada": /pista|borreguiles|sierra|veleta|montana|nieve/i,
  };
  for (const [name, re] of Object.entries(map)) {
    if (re.test(lower) || re.test(url)) return name + path.extname(file);
  }
  return file.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

async function fetchWaybackPage(pagePath, snap) {
  const url = `https://web.archive.org/web/${snap}id_/${BASE}${pagePath}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) return null;
  return res.text();
}

async function downloadImage(url, manifest, usedNames) {
  if (SKIP.some((re) => re.test(url))) return null;
  if (!url.includes("wp-content/uploads")) return null;
  if (manifest.some((m) => m.originalUrl === url)) return null;

  const ext = path.extname(new URL(url).pathname);
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext.toLowerCase())) return null;

  let baseName = semanticName(url);
  while (usedNames.has(baseName)) {
    const hash = createHash("md5").update(url + usedNames.size).digest("hex").slice(0, 6);
    baseName = baseName.replace(ext, `-${hash}${ext}`);
  }
  usedNames.add(baseName);

  const sources = [
    url,
    `https://web.archive.org/web/20221002201700im_/${url}`,
    `https://web.archive.org/web/20220817010230im_/${url}`,
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src, {
        headers: { "User-Agent": "ExploraSchool-MigrationBot/1.0" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue;
      const localPath = `/images/legacy/${baseName}`;
      await fs.writeFile(path.join(ROOT, "public", localPath.slice(1)), buf);
      return { originalUrl: url, localPath, alt: "", page: "", width: null, height: null, sizeBytes: buf.length };
    } catch {
      continue;
    }
  }
  return null;
}

function extractImageUrls(html) {
  const urls = new Set();
  const patterns = [
    /https?:\/\/(?:www\.)?sierranevadaclases\.es\/wp-content\/uploads\/[^"'\s)>]+/gi,
    /\/\/www\.sierranevadaclases\.es\/wp-content\/uploads\/[^"'\s)>]+/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      let u = m[0].replace(/&amp;/g, "&");
      if (u.startsWith("//")) u = "https:" + u;
      urls.add(u.split(/[?#]/)[0]); // strip query for dedup, keep full for download
    }
  }
  return [...urls];
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(HTML_DIR, { recursive: true });

  console.log("Fetching missing pages via Wayback...");
  for (const page of MISSING_PAGES) {
    const outPath = path.join(HTML_DIR, `${page.slug}.html`);
    try {
      await fs.access(outPath);
      console.log(`  skip ${page.slug} (exists)`);
      continue;
    } catch {
      /* fetch */
    }
    const html = await fetchWaybackPage(page.path, page.snap);
    if (html) {
      await fs.writeFile(outPath, html, "utf8");
      console.log(`  ✓ ${page.slug}`);
    } else {
      console.log(`  ✗ ${page.slug}`);
    }
    await sleep(2000);
  }

  const files = (await fs.readdir(HTML_DIR)).filter((f) => f.endsWith(".html"));
  const allUrls = new Set();
  for (const file of files) {
    const html = await fs.readFile(path.join(HTML_DIR, file), "utf8");
    extractImageUrls(html).forEach((u) => allUrls.add(u));
  }

  console.log(`\nFound ${allUrls.size} unique image URLs. Downloading...`);

  let manifest = [];
  try {
    manifest = JSON.parse(await fs.readFile(path.join(ROOT, "legacy", "images-manifest.json"), "utf8"));
  } catch {
    manifest = [];
  }

  const usedNames = new Set(manifest.map((m) => path.basename(m.localPath)));
  let downloaded = 0;

  for (const url of allUrls) {
    const entry = await downloadImage(url, manifest, usedNames);
    if (entry) {
      manifest.push(entry);
      downloaded++;
      console.log(`  ✓ ${path.basename(entry.localPath)}`);
    }
    await sleep(300);
  }

  await fs.writeFile(path.join(ROOT, "legacy", "images-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDownloaded ${downloaded} new images. Total: ${manifest.length}`);
}

main().catch(console.error);
