#!/usr/bin/env node
/**
 * Delete all student profiles from Firestore (users collection, excluding staff).
 * Also removes student media + linked live-gallery entries and progress reports.
 *
 * Usage: node scripts/reset-students.mjs
 */
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STAFF_EMAIL = "explora.sclub@gmail.com";

async function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    try {
      const envPath = path.join(ROOT, name);
      const content = await fsp.readFile(envPath, "utf8");
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
        value = value.replace(/\\n/g, "\n");
        if (!(key in process.env)) process.env[key] = value;
      }
    } catch {
      /* optional */
    }
  }
}

function initAdmin() {
  if (admin.apps.length) return admin.firestore();

  const saPath = path.join(ROOT, "serviceAccount.json");
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${sa.project_id}.appspot.com`,
    });
    return admin.firestore();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();

  if (!projectId || !clientEmail || !privateKey.includes("BEGIN")) {
    throw new Error("Missing Firebase credentials (.env.local or serviceAccount.json)");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      undefined,
  });
  return admin.firestore();
}

async function deleteQuery(db, query) {
  const snap = await query.get();
  if (snap.empty) return 0;
  let count = 0;
  let batch = db.batch();
  let ops = 0;
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    ops += 1;
    count += 1;
    if (ops >= 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
  return count;
}

async function main() {
  await loadEnv();
  const db = initAdmin();
  const bucket = admin.storage().bucket();

  const usersSnap = await db.collection("users").get();
  const students = usersSnap.docs.filter((doc) => {
    const email = String(doc.data().email || "").trim().toLowerCase();
    return email && email !== STAFF_EMAIL.toLowerCase();
  });

  console.log(`Found ${students.length} student profile(s) to delete.`);

  for (const userDoc of students) {
    const uid = userDoc.id;
    const email = userDoc.data().email;
    console.log(`- ${email || uid}`);

    const mediaSnap = await db.collection("studentMedia").where("studentUid", "==", uid).get();
    for (const mediaDoc of mediaSnap.docs) {
      const data = mediaDoc.data();
      if (data.liveGalleryId) {
        await db.collection("liveGallery").doc(String(data.liveGalleryId)).delete().catch(() => undefined);
      }
      if (data.storagePath) {
        await bucket.file(String(data.storagePath)).delete({ ignoreNotFound: true }).catch(() => undefined);
      }
      await mediaDoc.ref.delete();
    }

    await deleteQuery(db, db.collection("progressReports").where("studentUid", "==", uid));

    const leadSnap = await db.collection("leads").where("studentUid", "==", uid).get();
    if (!leadSnap.empty) {
      const batch = db.batch();
      for (const leadDoc of leadSnap.docs) {
        batch.update(leadDoc.ref, { studentUid: admin.firestore.FieldValue.delete() });
      }
      await batch.commit();
    }

    await userDoc.ref.delete();
  }

  console.log("Done. Student profiles reset.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
