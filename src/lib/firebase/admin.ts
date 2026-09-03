import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function loadServiceAccountFromFile(): ServiceAccountJson | null {
  const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidates = [
    configuredPath,
    resolve(process.cwd(), "serviceAccount.json"),
  ].filter(Boolean) as string[];

  for (const filePath of candidates) {
    try {
      if (!existsSync(filePath)) continue;
      const parsed = JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccountJson;
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return parsed;
      }
    } catch {
      /* try next */
    }
  }

  return null;
}

function getCredentialParts(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? "";
  const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const envPrivateKey = (process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "").trim();

  const envLooksValid =
    envProjectId.length > 0 &&
    envClientEmail.length > 0 &&
    envPrivateKey.length > 0 &&
    envPrivateKey !== "[SENSITIVE]" &&
    envPrivateKey.includes("BEGIN");

  if (envLooksValid) {
    return {
      projectId: envProjectId,
      clientEmail: envClientEmail,
      privateKey: envPrivateKey,
    };
  }

  const fileSa = loadServiceAccountFromFile();
  if (fileSa?.project_id && fileSa.client_email && fileSa.private_key) {
    return {
      projectId: fileSa.project_id,
      clientEmail: fileSa.client_email,
      privateKey: fileSa.private_key,
    };
  }

  return null;
}

function getStorageBucketName(projectId: string): string {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    `${projectId}.appspot.com`
  );
}

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0]!;

  const parts = getCredentialParts();
  if (!parts) return null;

  return initializeApp({
    credential: cert({
      projectId: parts.projectId,
      clientEmail: parts.clientEmail,
      privateKey: parts.privateKey,
    }),
    storageBucket: getStorageBucketName(parts.projectId),
  });
}

export function getAdminDb(): Firestore | null {
  try {
    const app = getAdminApp();
    if (!app) return null;
    return getFirestore(app);
  } catch (error) {
    console.error("[firebase-admin] Failed to initialize:", error);
    return null;
  }
}

export function getAdminStorage(): Storage | null {
  try {
    const app = getAdminApp();
    if (!app) return null;
    return getStorage(app);
  } catch (error) {
    console.error("[firebase-admin] Failed to initialize storage:", error);
    return null;
  }
}

export function getAdminBucket() {
  const storage = getAdminStorage();
  if (!storage) return null;
  const parts = getCredentialParts();
  if (!parts) return null;
  return storage.bucket(getStorageBucketName(parts.projectId));
}

export function isAdminConfigured(): boolean {
  return getCredentialParts() !== null;
}
