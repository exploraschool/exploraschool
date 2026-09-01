import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "ExploraSchool/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

async function getFacebookLogoUrl() {
  const res = await fetch(
    "https://graph.facebook.com/sierranevadaclases/picture?type=large&redirect=false",
  );
  const json = await res.json();
  const url = json?.data?.url;
  if (!url) throw new Error("Could not resolve Facebook logo URL");
  return url;
}

const sourceArg = process.argv[2];

let sourcePath = sourceArg;
if (!sourcePath) {
  console.log("Downloading official logo from Facebook page sierranevadaclases…");
  const url = await getFacebookLogoUrl();
  sourcePath = path.join(imagesDir, "logo-official-source.png");
  const bytes = await download(url, sourcePath);
  console.log(`✓ Saved source (${Math.round(bytes / 1024)} KB)`);
}

const targets = [
  ["logo-explora.png", "logo-explora.png"],
  ["logo-mark.png", "logo-mark.png"],
  ["logo-512.png", "logo-512.png"],
  ["favicon.png", "favicon.png"],
  ["apple-touch-icon.png", "apple-touch-icon.png"],
];

for (const [name] of targets) {
  const dest = path.join(imagesDir, name);
  await copyFile(sourcePath, dest);
  console.log(`✓ ${name}`);
}

const appDir = path.join(__dirname, "..", "src", "app");
await copyFile(path.join(imagesDir, "favicon.png"), path.join(appDir, "icon.png"));
await copyFile(path.join(imagesDir, "apple-touch-icon.png"), path.join(appDir, "apple-icon.png"));
console.log("✓ src/app/icon.png");
console.log("✓ src/app/apple-icon.png");

console.log("\nOfficial logo installed in public/images/");
console.log("Run: npm run process-logo");
