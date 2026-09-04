/**
 * Backfill confirmToken/cancelToken on pending booking leads using Firebase LEAD_CONFIRM_SECRET.
 * Makes already-sent email links verify against the stored token on Vercel.
 *
 * Usage:
 *   node scripts/backfill-lead-action-tokens.mjs
 */
import { createHmac } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function createConfirmToken(leadId, secret) {
  return createHmac("sha256", secret).update(leadId).digest("hex").slice(0, 32);
}

function createCancelToken(leadId, secret) {
  return createHmac("sha256", secret).update(`cancel:${leadId}`).digest("hex").slice(0, 32);
}

function loadServiceAccount() {
  const path =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    "";
  if (path && existsSync(path)) {
    return JSON.parse(readFileSync(path, "utf8"));
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) return JSON.parse(raw);
  return null;
}

const secret = execSync("firebase functions:secrets:access LEAD_CONFIRM_SECRET", {
  encoding: "utf8",
}).trim();

if (!secret || secret === "[SENSITIVE]") {
  console.error("Could not read LEAD_CONFIRM_SECRET from Firebase");
  process.exit(1);
}

const sa = loadServiceAccount();
if (!sa) {
  console.error("Missing Firebase service account (FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS)");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(sa) });
}

const db = getFirestore();
const snap = await db.collection("leads").where("status", "==", "pending").get();
let updated = 0;
let skipped = 0;

for (const doc of snap.docs) {
  const data = doc.data();
  const isBooking = data.type === "booking" || data.source === "booking-cart";
  if (!isBooking) {
    skipped += 1;
    continue;
  }
  if (data.confirmToken && data.cancelToken) {
    skipped += 1;
    continue;
  }
  await doc.ref.update({
    confirmToken: createConfirmToken(doc.id, secret),
    cancelToken: createCancelToken(doc.id, secret),
  });
  updated += 1;
}

console.log(JSON.stringify({ pending: snap.size, updated, skipped }));
