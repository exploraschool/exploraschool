import { randomUUID } from "crypto";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  LIVE_GALLERY_COLLECTION,
  listLiveGalleryPhotos,
  publicStorageUrl,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery";
import { revalidatePath } from "next/cache";
import { ensureDirectUploadCors } from "@/lib/storage-cors";
import {
  assertStudentMediaConstraints,
  normalizeStudentMediaContentType,
  resolveStudentMediaKind,
  studentMediaExtension,
  STUDENT_MEDIA_COLLECTION,
  STUDENT_MEDIA_MAX_PER_USER,
  STUDENT_MEDIA_STORAGE_PREFIX,
  type StudentMediaItem,
  type StudentMediaKind,
} from "@/lib/student-media-shared";

export {
  resolveStudentMediaKind,
  STUDENT_MEDIA_COLLECTION,
  STUDENT_MEDIA_IMAGE_MAX_BYTES,
  STUDENT_MEDIA_MAX_PER_USER,
  STUDENT_MEDIA_STORAGE_PREFIX,
  STUDENT_MEDIA_VIDEO_MAX_BYTES,
  STUDENT_MEDIA_VIDEO_MAX_SECONDS,
  type StudentMediaItem,
  type StudentMediaKind,
} from "@/lib/student-media-shared";

export function normalizeContentType(
  contentType: string,
  kind: StudentMediaKind,
  fileName = "",
): string {
  return normalizeStudentMediaContentType(contentType, fileName, kind);
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

async function publishToLiveGallery(params: {
  mediaId: string;
  studentUid: string;
  src: string;
  storagePath: string;
  displayName: string;
}): Promise<string> {
  const db = getAdminDb();
  if (!db) throw new Error("unavailable");

  const existing = await listLiveGalleryPhotos();
  const galleryId = randomUUID();
  const name = params.displayName.trim() || "Alumno Explora";
  const photo: LiveGalleryPhoto = {
    id: galleryId,
    src: params.src,
    storagePath: params.storagePath,
    altEs: `${name} en Sierra Nevada`,
    altEn: `${name} in Sierra Nevada`,
    order: existing.length > 0 ? Math.max(...existing.map((item) => item.order)) + 1 : 0,
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

function studentMediaObjectPath(studentUid: string, mediaId: string, ext: string): string {
  return `${STUDENT_MEDIA_STORAGE_PREFIX}/${studentUid}/${mediaId}.${ext}`;
}

function isOwnedStudentMediaPath(studentUid: string, mediaId: string, storagePath: string): boolean {
  const prefix = `${STUDENT_MEDIA_STORAGE_PREFIX}/${studentUid}/${mediaId}.`;
  return storagePath.startsWith(prefix) && storagePath.slice(prefix.length).split("/").length === 1;
}

async function assertQuotaAvailable(studentUid: string): Promise<void> {
  const existing = await listStudentMediaForUid(studentUid);
  if (existing.length >= STUDENT_MEDIA_MAX_PER_USER) throw new Error("media_limit");
}

function buildStudentMediaItem(params: {
  mediaId: string;
  studentUid: string;
  kind: StudentMediaKind;
  src: string;
  storagePath: string;
  contentType: string;
  fileName: string;
}): StudentMediaItem {
  return {
    id: params.mediaId,
    studentUid: params.studentUid,
    kind: params.kind,
    src: params.src,
    storagePath: params.storagePath,
    contentType: params.contentType,
    fileName: params.fileName,
    createdAt: new Date().toISOString(),
    forCorrection: true,
    correctionNotes: "",
    reviewedAt: null,
    reviewedByInstructorSlug: "",
    liveGalleryId: null,
    publishedToGallery: false,
  };
}

export async function prepareStudentMediaUpload(params: {
  studentUid: string;
  fileName: string;
  contentType: string;
  size: number;
  durationSeconds?: number | null;
}): Promise<{ uploadUrl: string; mediaId: string; storagePath: string; contentType: string }> {
  const bucket = getAdminBucket();
  if (!bucket) throw new Error("unavailable");

  const kind = resolveStudentMediaKind(params.contentType, params.fileName);
  if (!kind) throw new Error("invalid_type");
  assertStudentMediaConstraints({
    kind,
    size: params.size,
    durationSeconds: params.durationSeconds,
  });
  await assertQuotaAvailable(params.studentUid);

  const contentType = normalizeStudentMediaContentType(params.contentType, params.fileName, kind);
  const mediaId = randomUUID();
  const ext = studentMediaExtension(contentType, params.fileName, kind);
  const storagePath = studentMediaObjectPath(params.studentUid, mediaId, ext);
  await ensureDirectUploadCors(bucket);

  const [uploadUrl] = await bucket.file(storagePath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  return { uploadUrl, mediaId, storagePath, contentType };
}

export async function completeStudentMediaUpload(params: {
  studentUid: string;
  mediaId: string;
  storagePath: string;
  contentType: string;
  fileName: string;
  durationSeconds?: number | null;
}): Promise<{ media: StudentMediaItem; publishedToGallery: boolean }> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) throw new Error("unavailable");
  if (!isOwnedStudentMediaPath(params.studentUid, params.mediaId, params.storagePath)) {
    throw new Error("forbidden");
  }

  const kind = resolveStudentMediaKind(params.contentType, params.fileName);
  if (!kind) throw new Error("invalid_type");
  assertStudentMediaConstraints({
    kind,
    size: 1,
    durationSeconds: params.durationSeconds,
  });
  await assertQuotaAvailable(params.studentUid);

  const file = bucket.file(params.storagePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error("upload_incomplete");

  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size ?? 0);
  if (!Number.isFinite(size) || size <= 0) throw new Error("upload_incomplete");
  assertStudentMediaConstraints({
    kind,
    size,
    durationSeconds: params.durationSeconds,
  });

  const contentType = normalizeStudentMediaContentType(params.contentType, params.fileName, kind);
  const token = randomUUID();
  await file.setMetadata({
    contentType,
    metadata: { firebaseStorageDownloadTokens: token },
    cacheControl: "public, max-age=31536000",
  });

  const media = buildStudentMediaItem({
    mediaId: params.mediaId,
    studentUid: params.studentUid,
    kind,
    src: publicStorageUrl(bucket.name, params.storagePath, token),
    storagePath: params.storagePath,
    contentType,
    fileName: params.fileName,
  });
  await db.collection(STUDENT_MEDIA_COLLECTION).doc(params.mediaId).set(media);
  return { media, publishedToGallery: false };
}

export async function createStudentMediaFromUpload(params: {
  studentUid: string;
  displayName: string;
  file: File;
  /** Client-reported duration for videos (seconds). Best-effort on mobile. */
  durationSeconds?: number | null;
}): Promise<{ media: StudentMediaItem; publishedToGallery: boolean }> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) throw new Error("unavailable");

  const kind = resolveStudentMediaKind(params.file.type, params.file.name);
  if (!kind) throw new Error("invalid_type");
  assertStudentMediaConstraints({
    kind,
    size: params.file.size,
    durationSeconds: params.durationSeconds,
  });
  await assertQuotaAvailable(params.studentUid);

  const contentType = normalizeStudentMediaContentType(params.file.type, params.file.name, kind);
  const mediaId = randomUUID();
  const ext = studentMediaExtension(contentType, params.file.name, kind);
  const storagePath = studentMediaObjectPath(params.studentUid, mediaId, ext);
  const buffer = Buffer.from(await params.file.arrayBuffer());
  const token = randomUUID();

  await bucket.file(storagePath).save(buffer, {
    contentType,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: token },
      cacheControl: "public, max-age=31536000",
    },
  });

  const media = buildStudentMediaItem({
    mediaId,
    studentUid: params.studentUid,
    kind,
    src: publicStorageUrl(bucket.name, storagePath, token),
    storagePath,
    contentType,
    fileName: params.file.name,
  });
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
