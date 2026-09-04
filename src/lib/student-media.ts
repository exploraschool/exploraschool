import { randomUUID } from "crypto";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  LIVE_GALLERY_COLLECTION,
  LIVE_GALLERY_MAX_PHOTOS,
  listLiveGalleryPhotos,
  publicStorageUrl,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery";
import { revalidatePath } from "next/cache";
import {
  STUDENT_MEDIA_COLLECTION,
  STUDENT_MEDIA_IMAGE_MAX_BYTES,
  STUDENT_MEDIA_MAX_PER_USER,
  STUDENT_MEDIA_STORAGE_PREFIX,
  STUDENT_MEDIA_VIDEO_MAX_BYTES,
  STUDENT_MEDIA_VIDEO_MAX_SECONDS,
  type StudentMediaItem,
  type StudentMediaKind,
} from "@/lib/student-media-shared";

export {
  STUDENT_MEDIA_COLLECTION,
  STUDENT_MEDIA_IMAGE_MAX_BYTES,
  STUDENT_MEDIA_MAX_PER_USER,
  STUDENT_MEDIA_STORAGE_PREFIX,
  STUDENT_MEDIA_VIDEO_MAX_BYTES,
  STUDENT_MEDIA_VIDEO_MAX_SECONDS,
  type StudentMediaItem,
  type StudentMediaKind,
} from "@/lib/student-media-shared";

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function resolveStudentMediaKind(contentType: string, fileName: string): StudentMediaKind | null {
  const type = contentType.toLowerCase();
  if (IMAGE_TYPES.has(type)) return "image";
  if (VIDEO_TYPES.has(type)) return "video";
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") return "image";
  if (ext === "mp4" || ext === "webm" || ext === "mov") return "video";
  return null;
}

export function normalizeContentType(contentType: string, kind: StudentMediaKind): string {
  const type = contentType.toLowerCase();
  if (kind === "image") {
    if (type === "image/jpg" || type === "image/jpeg") return "image/jpeg";
    if (type === "image/png") return "image/png";
    if (type === "image/webp") return "image/webp";
    return "image/jpeg";
  }
  if (type === "video/webm") return "video/webm";
  if (type === "video/quicktime") return "video/quicktime";
  return "video/mp4";
}

function extensionFor(contentType: string, fileName: string, kind: StudentMediaKind): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (kind === "image") {
    if (fromName === "png" || fromName === "webp" || fromName === "jpg" || fromName === "jpeg") {
      return fromName === "jpeg" ? "jpg" : fromName;
    }
    return contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  }
  if (fromName === "webm" || fromName === "mov" || fromName === "mp4") return fromName === "mov" ? "mov" : fromName;
  return contentType.includes("webm") ? "webm" : "mp4";
}

export function parseStudentMedia(id: string, data: Record<string, unknown>): StudentMediaItem {
  return {
    id,
    studentUid: typeof data.studentUid === "string" ? data.studentUid : "",
    kind: data.kind === "video" ? "video" : "image",
    src: typeof data.src === "string" ? data.src : "",
    storagePath: typeof data.storagePath === "string" ? data.storagePath : "",
    contentType: typeof data.contentType === "string" ? data.contentType : "",
    fileName: typeof data.fileName === "string" ? data.fileName : "",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
    forCorrection: true,
    correctionNotes: typeof data.correctionNotes === "string" ? data.correctionNotes : "",
    reviewedAt: typeof data.reviewedAt === "string" ? data.reviewedAt : null,
    reviewedByInstructorSlug:
      typeof data.reviewedByInstructorSlug === "string" ? data.reviewedByInstructorSlug : "",
    liveGalleryId: typeof data.liveGalleryId === "string" ? data.liveGalleryId : null,
    publishedToGallery: data.publishedToGallery === true,
  };
}

export async function listStudentMediaForUid(uid: string): Promise<StudentMediaItem[]> {
  if (!isAdminConfigured()) return [];
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snap = await db.collection(STUDENT_MEDIA_COLLECTION).where("studentUid", "==", uid).get();
    return snap.docs
      .map((doc) => parseStudentMedia(doc.id, doc.data() as Record<string, unknown>))
      .filter((item) => item.src)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error("[student-media] list failed:", error);
    return [];
  }
}

function revalidateGalleryPages() {
  revalidatePath("/");
  revalidatePath("/es");
  revalidatePath("/en");
}

async function makeRoomInLiveGallery(): Promise<boolean> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) return false;

  const existing = await listLiveGalleryPhotos();
  if (existing.length < LIVE_GALLERY_MAX_PHOTOS) return true;

  const studentSourced = existing
    .filter((photo) => photo.source === "student")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const victim = studentSourced[0];
  if (!victim) return false;

  // Student gallery entries reuse student-media storage — only remove the gallery doc.
  const sharedStudentFile = victim.storagePath.startsWith(`${STUDENT_MEDIA_STORAGE_PREFIX}/`);
  if (!sharedStudentFile) {
    try {
      if (victim.storagePath) await bucket.file(victim.storagePath).delete({ ignoreNotFound: true });
    } catch (error) {
      console.error("[student-media] gallery rotate storage failed:", error);
    }
  }
  await db.collection(LIVE_GALLERY_COLLECTION).doc(victim.id).delete();

  if (victim.studentMediaId) {
    await db.collection(STUDENT_MEDIA_COLLECTION).doc(victim.studentMediaId).set(
      { liveGalleryId: null, publishedToGallery: false },
      { merge: true },
    );
  }

  return true;
}

async function publishToLiveGallery(params: {
  mediaId: string;
  studentUid: string;
  src: string;
  storagePath: string;
  displayName: string;
}): Promise<string | null> {
  const db = getAdminDb();
  if (!db) return null;

  const hasRoom = await makeRoomInLiveGallery();
  if (!hasRoom) {
    const existing = await listLiveGalleryPhotos();
    if (existing.length >= LIVE_GALLERY_MAX_PHOTOS) return null;
  }

  const existing = await listLiveGalleryPhotos();
  const galleryId = randomUUID();
  const name = params.displayName.trim() || "Alumno Explora";
  const photo: LiveGalleryPhoto = {
    id: galleryId,
    src: params.src,
    storagePath: params.storagePath,
    altEs: `${name} en Sierra Nevada`,
    altEn: `${name} in Sierra Nevada`,
    order: existing.length,
    createdAt: new Date().toISOString(),
    kind: "image",
    source: "student",
    studentUid: params.studentUid,
    studentMediaId: params.mediaId,
  };

  await db.collection(LIVE_GALLERY_COLLECTION).doc(galleryId).set(photo);
  revalidateGalleryPages();
  return galleryId;
}

export async function createStudentMediaFromUpload(params: {
  studentUid: string;
  displayName: string;
  file: File;
  /** Client-reported duration for videos (seconds). Required for videos. */
  durationSeconds?: number | null;
}): Promise<{ media: StudentMediaItem; publishedToGallery: boolean }> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) throw new Error("unavailable");

  const kind = resolveStudentMediaKind(params.file.type, params.file.name);
  if (!kind) throw new Error("invalid_type");

  const maxBytes = kind === "image" ? STUDENT_MEDIA_IMAGE_MAX_BYTES : STUDENT_MEDIA_VIDEO_MAX_BYTES;
  if (params.file.size > maxBytes) throw new Error("file_too_large");

  if (kind === "video") {
    const duration = params.durationSeconds;
    if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
      throw new Error("duration_required");
    }
    if (duration > STUDENT_MEDIA_VIDEO_MAX_SECONDS + 0.25) {
      throw new Error("video_too_long");
    }
  }

  const existing = await listStudentMediaForUid(params.studentUid);
  if (existing.length >= STUDENT_MEDIA_MAX_PER_USER) throw new Error("media_limit");

  const contentType = normalizeContentType(params.file.type, kind);
  const mediaId = randomUUID();
  const ext = extensionFor(contentType, params.file.name, kind);
  const storagePath = `${STUDENT_MEDIA_STORAGE_PREFIX}/${params.studentUid}/${mediaId}.${ext}`;
  const buffer = Buffer.from(await params.file.arrayBuffer());
  const token = randomUUID();

  await bucket.file(storagePath).save(buffer, {
    contentType,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: token },
      cacheControl: "public, max-age=31536000",
    },
  });

  const src = publicStorageUrl(bucket.name, storagePath, token);
  const now = new Date().toISOString();

  const media: StudentMediaItem = {
    id: mediaId,
    studentUid: params.studentUid,
    kind,
    src,
    storagePath,
    contentType,
    fileName: params.file.name,
    createdAt: now,
    forCorrection: true,
    correctionNotes: "",
    reviewedAt: null,
    reviewedByInstructorSlug: "",
    liveGalleryId: null,
    publishedToGallery: false,
  };

  await db.collection(STUDENT_MEDIA_COLLECTION).doc(mediaId).set(media);
  return { media, publishedToGallery: false };
}

/** Photos only — videos stay for corrections and never go to the live gallery. */
export async function publishStudentMediaToGallery(params: {
  mediaId: string;
  studentUid: string;
  displayName: string;
}): Promise<StudentMediaItem> {
  const db = getAdminDb();
  if (!db) throw new Error("unavailable");

  const ref = db.collection(STUDENT_MEDIA_COLLECTION).doc(params.mediaId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("not_found");

  const media = parseStudentMedia(params.mediaId, snap.data() as Record<string, unknown>);
  if (media.studentUid !== params.studentUid) throw new Error("forbidden");
  if (media.kind !== "image") throw new Error("videos_not_allowed");
  if (media.publishedToGallery && media.liveGalleryId) return media;

  const liveGalleryId = await publishToLiveGallery({
    mediaId: media.id,
    studentUid: media.studentUid,
    src: media.src,
    storagePath: media.storagePath,
    displayName: params.displayName,
  });
  if (!liveGalleryId) throw new Error("gallery_full");

  await ref.set({ liveGalleryId, publishedToGallery: true }, { merge: true });
  return { ...media, liveGalleryId, publishedToGallery: true };
}

export async function updateStudentMediaCorrection(
  mediaId: string,
  patch: {
    correctionNotes?: string;
    reviewedAt?: string | null;
    reviewedByInstructorSlug?: string;
  },
): Promise<StudentMediaItem | null> {
  const db = getAdminDb();
  if (!db) return null;
  const ref = db.collection(STUDENT_MEDIA_COLLECTION).doc(mediaId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.set(patch, { merge: true });
  const next = await ref.get();
  return parseStudentMedia(mediaId, next.data() as Record<string, unknown>);
}

export async function unlinkStudentMediaFromGallery(mediaId: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;
  const ref = db.collection(STUDENT_MEDIA_COLLECTION).doc(mediaId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const media = parseStudentMedia(mediaId, snap.data() as Record<string, unknown>);
  if (media.liveGalleryId) {
    await db.collection(LIVE_GALLERY_COLLECTION).doc(media.liveGalleryId).delete().catch(() => undefined);
    revalidateGalleryPages();
  }
  await ref.set({ liveGalleryId: null, publishedToGallery: false }, { merge: true });
  return true;
}

export async function deleteAllStudentMediaForUid(uid: string): Promise<number> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db) return 0;

  const items = await listStudentMediaForUid(uid);
  let deleted = 0;
  for (const item of items) {
    if (item.liveGalleryId) {
      await db.collection(LIVE_GALLERY_COLLECTION).doc(item.liveGalleryId).delete().catch(() => undefined);
    }
    if (bucket && item.storagePath) {
      try {
        await bucket.file(item.storagePath).delete({ ignoreNotFound: true });
      } catch (error) {
        console.error("[student-media] storage delete failed:", error);
      }
    }
    await db.collection(STUDENT_MEDIA_COLLECTION).doc(item.id).delete();
    deleted += 1;
  }
  if (deleted > 0) revalidateGalleryPages();
  return deleted;
}
