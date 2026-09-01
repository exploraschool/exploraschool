#!/usr/bin/env node
/**
 * Seed Firestore with instructors, prices, FAQs and reviews from src/data/*.ts
 *
 * Usage:
 *   cp .env.example .env   # fill FIREBASE_* credentials
 *   npm run seed
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");

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

/** Extract a `export const name = …` array/object literal from a TS module. */
async function loadTsExport(fileName, exportName) {
  const filePath = path.join(DATA_DIR, fileName);
  const source = await fs.readFile(filePath, "utf8");
  const startPattern = new RegExp(
    `export const ${exportName}(?:\\s*:[^=]+)?\\s*=\\s*`,
  );
  const startMatch = startPattern.exec(source);
  if (!startMatch) {
    throw new Error(`Could not find export const ${exportName} in ${fileName}`);
  }

  let index = startMatch.index + startMatch[0].length;
  const opener = source[index];
  if (opener !== "[" && opener !== "{") {
    throw new Error(`Expected array or object for ${exportName} in ${fileName}`);
  }
  const closer = opener === "[" ? "]" : "}";

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        index += 1;
        break;
      }
    }
  }

  let literal = source.slice(startMatch.index + startMatch[0].length, index)
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+as const/g, "");

  // eslint-disable-next-line no-eval
  return eval(`(${literal})`);
}

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  return admin.initializeApp({
    projectId: projectId ?? process.env.GCLOUD_PROJECT,
  });
}

async function seedCollection(db, collectionName, docs, idField) {
  const batch = db.batch();
  let count = 0;

  for (const doc of docs) {
    const id = doc[idField];
    if (!id) {
      throw new Error(`${collectionName}: missing ${idField} on ${JSON.stringify(doc)}`);
    }
    batch.set(db.collection(collectionName).doc(String(id)), doc, { merge: true });
    count += 1;
  }

  await batch.commit();
  return count;
}

async function main() {
  await loadEnv();
  initAdmin();
  const db = admin.firestore();

  console.log("Loading seed data from src/data/*.ts …");

  const [instructors, faqs, reviews, currentPrices, legacyPriceTables, legacyFromPrices, priceNotes] =
    await Promise.all([
      loadTsExport("instructors.ts", "instructors"),
      loadTsExport("faqs.ts", "faqs"),
      loadTsExport("reviews.ts", "reviews"),
      loadTsExport("prices.ts", "currentPrices"),
      loadTsExport("prices.ts", "legacyPriceTables"),
      loadTsExport("prices.ts", "legacyFromPrices"),
      loadTsExport("prices.ts", "priceNotes"),
    ]);

  const instructorCount = await seedCollection(db, "instructors", instructors, "slug");
  const faqCount = await seedCollection(db, "faqs", faqs, "id");
  const reviewCount = await seedCollection(db, "reviews", reviews, "id");

  await db.collection("prices").doc("main").set(
    {
      currentPrices,
      legacyPriceTables,
      legacyFromPrices,
      priceNotes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`Seeded ${instructorCount} instructors`);
  console.log(`Seeded ${faqCount} FAQs`);
  console.log(`Seeded ${reviewCount} reviews`);
  console.log("Seeded prices/main document");
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
