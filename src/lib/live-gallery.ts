import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  getFallbackLiveGalleryPhotos,
  LIVE_GALLERY_COLLECTION,
  type LiveGalleryDisplayPhoto,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery-shared";

export {
  getFallbackLiveGalleryPhotos,
  LIVE_GALLERY_COLLECTION,
  LIVE_GALLERY_MAX_PHOTOS,
  LIVE_GALLERY_MAX_UPLOAD_BATCH,
  LIVE_GALLERY_STORAGE_PREFIX,
  publicStorageUrl,
  type LiveGalleryDisplayPhoto,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery-shared";

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
    } satisfies LiveGalleryPhoto;
  });

  return photos
    .filter((photo) => photo.src)
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

/** Photos for the public homepage section (Firestore or static fallback). */
export async function getLiveGalleryForHome(limit = 8): Promise<LiveGalleryDisplayPhoto[]> {
  try {
    const photos = await listLiveGalleryPhotos();
    if (photos.length === 0) return getFallbackLiveGalleryPhotos();
    return photos.slice(0, limit).map(({ id, src, altEs, altEn }) => ({ id, src, altEs, altEn }));
  } catch (error) {
    console.error("[live-gallery] Failed to load photos:", error);
    return getFallbackLiveGalleryPhotos();
  }
}
