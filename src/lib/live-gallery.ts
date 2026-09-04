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

/** Newest photos for the public homepage section (Firestore or static fallback). */
export async function getLiveGalleryForHome(
  limit = LIVE_GALLERY_HOME_LIMIT,
): Promise<LiveGalleryDisplayPhoto[]> {
  try {
    const photos = await listLiveGalleryPhotos();
    if (photos.length === 0) return getFallbackLiveGalleryPhotos();
    return photos
      .filter((item) => (item.kind ?? "image") !== "video")
      .slice(0, limit)
      .map(({ id, src, altEs, altEn, kind }) => ({
        id,
        src,
        altEs,
        altEn,
        kind: kind ?? "image",
      }));
  } catch (error) {
    console.error("[live-gallery] Failed to load photos:", error);
    return getFallbackLiveGalleryPhotos();
  }
}
