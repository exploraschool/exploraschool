import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");
const appDir = path.join(__dirname, "..", "src", "app");

const WHITE_THRESHOLD = 228;

function isBackgroundPixel(r, g, b, a) {
  if (a < 10) return true;
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
}

function floodFillBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y], [width - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const i = y * width + x;
    if (visited[i]) continue;

    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (!isBackgroundPixel(r, g, b, a)) continue;

    visited[i] = 1;
    data[idx + 3] = 0;

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

async function processLogo(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  floodFillBackground(pixels, info.width, info.height);

  const transparent = sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();

  const trimmed = await transparent.trim({ threshold: 1 }).toBuffer();
  const meta = await sharp(trimmed).metadata();

  const outputs = {
    "logo-explora.png": { size: 512, padding: 0 },
    "logo-mark.png": { size: 256, padding: 0 },
    "logo-512.png": { size: 512, padding: 0 },
    "favicon.png": { size: 48, padding: 3 },
    "apple-touch-icon.png": { size: 180, padding: 10 },
  };

  await mkdir(imagesDir, { recursive: true });

  for (const [filename, { size, padding }] of Object.entries(outputs)) {
    const inner = size - padding * 2;
    const resized = await sharp(trimmed)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    await writeFile(path.join(imagesDir, filename), resized);
    console.log(`✓ ${filename} (${size}×${size}, transparent)`);
  }

  console.log(`   Trimmed to ${meta.width}×${meta.height}`);
}

const input =
  process.argv[2] ??
  path.join(imagesDir, "logo-official-source.png");

await processLogo(input);

await copyFile(path.join(imagesDir, "favicon.png"), path.join(appDir, "icon.png"));
await copyFile(path.join(imagesDir, "apple-touch-icon.png"), path.join(appDir, "apple-icon.png"));
console.log("✓ src/app/icon.png");
console.log("✓ src/app/apple-icon.png");
