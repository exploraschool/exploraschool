import { media } from "@/lib/media";

export const LIVE_GALLERY_COLLECTION = "liveGallery";
export const LIVE_GALLERY_STORAGE_PREFIX = "public/live-gallery";
/** How many of the newest photos the homepage carousel shows. Storage has no cap. */
export const LIVE_GALLERY_HOME_LIMIT = 12;
export const LIVE_GALLERY_MAX_UPLOAD_BATCH = 5;

export type LiveGalleryPhoto = {
  id: string;
  src: string;
  storagePath: string;
  altEs: string;
  altEn: string;
  order: number;
  createdAt: string;
  kind?: "image" | "video";
  source?: "admin" | "student";
  studentUid?: string;
  studentMediaId?: string;
};

export type LiveGalleryDisplayPhoto = {
  id: string;
  src: string;
  altEs: string;
  altEn: string;
  kind?: "image" | "video";
};

export function getFallbackLiveGalleryPhotos(): LiveGalleryDisplayPhoto[] {
  return [
    {
      id: "fallback-0",
      src: media.gallery[0].src,
      altEs: media.gallery[0].altEs,
      altEn: media.gallery[0].altEn,
    },
    {
      id: "fallback-1",
      src: media.gallery[3].src,
      altEs: media.gallery[3].altEs,
      altEn: media.gallery[3].altEn,
    },
    {
      id: "fallback-2",
      src: "/images/stock/home-gallery-snow.jpg",
      altEs: "Pistas de la estación de esquí de Sierra Nevada",
      altEn: "Slopes at Sierra Nevada ski resort",
    },
    {
      id: "fallback-3",
      src: media.gallery[5].src,
      altEs: media.gallery[5].altEs,
      altEn: media.gallery[5].altEn,
    },
  ];
}

export function publicStorageUrl(bucketName: string, storagePath: string, token?: string): string {
  const base = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`;
  return token ? `${base}&token=${token}` : base;
}
