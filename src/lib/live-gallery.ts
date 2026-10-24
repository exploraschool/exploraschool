import { revalidateTag, unstable_cache } from "next/cache";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  getFallbackLiveGalleryPhotos,
  LIVE_GALLERY_COLLECTION,
  LIVE_GALLERY_HOME_LIMIT,
  type LiveGalleryDisplayPhoto,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery-shared";

export {
  getFallbackLiveGalleryPhotos,
  LIVE_GALLERY_COLLECTION,
  LIVE_GALLERY_HOME_LIMIT,
  LIVE_GALLERY_MAX_UPLOAD_BATCH,
  LIVE_GALLERY_STORAGE_PREFIX,
  publicStorageUrl,
  type LiveGalleryDisplayPhoto,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery-shared";

export const LIVE_GALLERY_CACHE_TAG = "live-gallery";
const LIVE_GALLERY_REVALIDATE_SECONDS = 60 * 60;
/** Extra rows so videos near the top do not push real photos out of the homepage. */
const LIVE_GALLERY_QUERY_EXTRA = 24;

export function revalidateLiveGalleryCache() {
  revalidateTag(LIVE_GALLERY_CACHE_TAG, { expire: 0 });
}

export async function listLiveGalleryPhotos(): Promise<LiveGalleryPhoto[]> {
  if (!isAdminConfigured()) return [];

  const db = getAdminDb();
  if (!db) return [];

  const snapshot = await db.collection(LIVE_GALLERY_COLLECTION).get();
  const photos = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      src: String(data.src ?? ""),
      storagePath: String(data.storagePath ?? ""),
      altEs: String(data.altEs ?? "Sierra Nevada en directo"),
      altEn: String(data.altEn ?? "Sierra Nevada live"),
      order: typeof data.order === "number" ? data.order : 0,
      createdAt: String(data.createdAt ?? ""),
      kind: data.kind === "video" ? ("video" as const) : ("image" as const),
      source: data.source === "student" ? ("student" as const) : ("admin" as const),
      studentUid: typeof data.studentUid === "string" ? data.studentUid : undefined,
      studentMediaId: typeof data.studentMediaId === "string" ? data.studentMediaId : undefined,
    } satisfies LiveGalleryPhoto;
  });

  return photos
    .filter((photo) => photo.src)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.order - a.order);
}

async function loadRecentHomePhotos(limit: number): Promise<LiveGalleryDisplayPhoto[]> {
  const db = getAdminDb();
  if (!db) return [];

  const snapshot = await db
    .collection(LIVE_GALLERY_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit + LIVE_GALLERY_QUERY_EXTRA)
    .get();

  const photos: LiveGalleryDisplayPhoto[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const src = String(data.src ?? "");
    if (!src || data.kind === "video") continue;
    photos.push({
      id: doc.id,
      src,
      altEs: String(data.altEs ?? "Sierra Nevada en directo"),
      altEn: String(data.altEn ?? "Sierra Nevada live"),
      kind: "image",
    });
    if (photos.length >= limit) break;
  }
  return photos;
}

const loadRecentHomePhotosCached = unstable_cache(loadRecentHomePhotos, ["live-gallery-home"], {
  revalidate: LIVE_GALLERY_REVALIDATE_SECONDS,
  tags: [LIVE_GALLERY_CACHE_TAG],
});

/** Newest photos for the public homepage section (Firestore or static fallback). */
export async function getLiveGalleryForHome(
  limit = LIVE_GALLERY_HOME_LIMIT,
): Promise<LiveGalleryDisplayPhoto[]> {
  if (!isAdminConfigured()) return getFallbackLiveGalleryPhotos();

  try {
    const photos = await loadRecentHomePhotosCached(limit);
    if (photos.length === 0) return getFallbackLiveGalleryPhotos();
    return photos;
  } catch (error) {
    console.error("[live-gallery] Failed to load photos:", error);
    return getFallbackLiveGalleryPhotos();
  }
}
