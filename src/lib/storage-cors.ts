import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import type { getAdminBucket } from "@/lib/firebase/admin";

type AdminBucket = NonNullable<ReturnType<typeof getAdminBucket>>;

type CorsEntry = {
  origin?: string[];
  method?: string[];
  responseHeader?: string[];
  maxAgeSeconds?: number;
};

const REQUIRED_METHODS = ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"];
const REQUIRED_HEADERS = [
  "Content-Type",
  "Content-Length",
  "Content-Range",
  "x-goog-resumable",
  "x-goog-content-length-range",
];

let corsEnsured = false;
let corsEnsurePromise: Promise<void> | null = null;

function uploadCorsOrigins(): string[] {
  const origins = new Set([
    PRODUCTION_SITE_URL,
    "https://explora-school.es",
    "http://localhost:3000",
    "http://localhost:3001",
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) origins.add(site);

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) origins.add(`https://${vercel}`);

  return [...origins];
}

function corsAllowsBrowserPuts(cors: CorsEntry[], origins: string[]): boolean {
  return cors.some((entry) => {
    const entryOrigins = (entry.origin ?? []).map(String);
    const methods = (entry.method ?? []).map((method) => String(method).toUpperCase());
    const headers = (entry.responseHeader ?? []).map((header) => String(header).toLowerCase());
    const originOk =
      entryOrigins.includes("*") || origins.every((origin) => entryOrigins.includes(origin));
    return originOk && methods.includes("PUT") && methods.includes("OPTIONS") && headers.includes("content-type");
  });
}

export async function ensureDirectUploadCors(bucket: AdminBucket): Promise<void> {
  if (corsEnsured) return;
  if (corsEnsurePromise) return corsEnsurePromise;

  corsEnsurePromise = (async () => {
    const origins = uploadCorsOrigins();
    const [metadata] = await bucket.getMetadata();
    const cors = (Array.isArray(metadata.cors) ? metadata.cors : []) as CorsEntry[];
    if (corsAllowsBrowserPuts(cors, origins)) {
      corsEnsured = true;
      return;
    }

    await bucket.setCorsConfiguration([
      ...cors.filter((entry) => !corsAllowsBrowserPuts([entry], origins)),
      {
        origin: origins,
        method: REQUIRED_METHODS,
        responseHeader: REQUIRED_HEADERS,
        maxAgeSeconds: 3600,
      },
    ]);
    corsEnsured = true;
  })().catch((error) => {
    corsEnsurePromise = null;
    console.error("[storage-cors] failed to set bucket CORS:", error);
  });

  await corsEnsurePromise;
}
