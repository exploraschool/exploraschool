#!/usr/bin/env node
/**
 * Upload public/images/legacy/** to Firebase Storage at public/legacy/**
 *
 * Usage:
 *   cp .env.example .env   # fill FIREBASE_* credentials
 *   npm run upload-legacy
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Load KEY=VALUE pairs from .env (no external deps). */
async function loadEnv() {
  try {
    const envPath = path.join(ROOT, ".env");
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional when vars are exported in the shell
  }
}
const LEGACY_DIR = path.join(ROOT, "public", "images", "legacy");
const STORAGE_PREFIX = "public/legacy";

const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${projectId}.appspot.com`;

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });
  }

  return admin.initializeApp({ projectId, storageBucket });
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function contentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

async function main() {
  await loadEnv();
  let localFiles;
  try {
    localFiles = await listFiles(LEGACY_DIR);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`Directory not found: ${LEGACY_DIR}`);
      console.error("Add images to public/images/legacy/ or run: npm run scrape");
      process.exit(1);
    }
    throw error;
  }

  if (localFiles.length === 0) {
    console.warn(`No files in ${LEGACY_DIR} — nothing to upload.`);
    return;
  }

  initAdmin();
  const bucket = admin.storage().bucket();

  console.log(`Uploading ${localFiles.length} file(s) to gs://${bucket.name}/${STORAGE_PREFIX}/ …`);

  let uploaded = 0;
  for (const localPath of localFiles) {
    const relative = path.relative(LEGACY_DIR, localPath).replace(/\\/g, "/");
    const destination = `${STORAGE_PREFIX}/${relative}`;
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: contentType(localPath),
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    uploaded += 1;
    console.log(`  ↑ ${relative}`);
  }

  console.log(`Uploaded ${uploaded} file(s). Public URL base:`);
  console.log(`  https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/public%2Flegacy%2F`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
