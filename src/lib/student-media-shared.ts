/** Shared student-media limits (safe for client + server). */

export const STUDENT_MEDIA_MAX_PER_USER = 24;
export const STUDENT_MEDIA_IMAGE_MAX_BYTES = 6 * 1024 * 1024;
export const STUDENT_MEDIA_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
/** Files at or below this size can still go through the Next.js API if direct Storage PUT fails. */
export const STUDENT_MEDIA_PROXY_FALLBACK_MAX_BYTES = 3.5 * 1024 * 1024;
/** Max duration for student correction videos (seconds). */
export const STUDENT_MEDIA_VIDEO_MAX_SECONDS = 30;

export const STUDENT_MEDIA_COLLECTION = "studentMedia";
export const STUDENT_MEDIA_STORAGE_PREFIX = "student-media";

export type StudentMediaKind = "image" | "video";

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
  "video/hevc",
  "video/h265",
]);
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "m4v", "3gp", "3gpp"]);

export type StudentMediaItem = {
  id: string;
  studentUid: string;
  kind: StudentMediaKind;
  src: string;
  storagePath: string;
  contentType: string;
  fileName: string;
  createdAt: string;
  forCorrection: true;
  correctionNotes: string;
  reviewedAt: string | null;
  reviewedByInstructorSlug: string;
  liveGalleryId: string | null;
  publishedToGallery: boolean;
};

function fileExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ext === fileName.toLowerCase() ? "" : ext;
}

export function studentMediaMaxBytes(kind: StudentMediaKind): number {
  return kind === "image" ? STUDENT_MEDIA_IMAGE_MAX_BYTES : STUDENT_MEDIA_VIDEO_MAX_BYTES;
}

export function resolveStudentMediaKind(contentType: string, fileName: string): StudentMediaKind | null {
  const type = contentType.trim().toLowerCase();
  if (IMAGE_TYPES.has(type)) return "image";
  if (VIDEO_TYPES.has(type) || type.startsWith("video/")) return "video";
  const ext = fileExtension(fileName);
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  return null;
}

export function normalizeStudentMediaContentType(
  contentType: string,
  fileName: string,
  kind: StudentMediaKind,
): string {
  const type = contentType.trim().toLowerCase();
  const ext = fileExtension(fileName);
  if (kind === "image") {
    if (type === "image/jpg" || type === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (type === "image/png" || ext === "png") return "image/png";
    if (type === "image/webp" || ext === "webp") return "image/webp";
    return "image/jpeg";
  }
  if (type === "video/webm" || ext === "webm") return "video/webm";
  if (type === "video/quicktime" || type === "video/hevc" || type === "video/h265" || ext === "mov") {
    return "video/quicktime";
  }
  if (type === "video/x-m4v" || ext === "m4v") return "video/x-m4v";
  if (type === "video/3gpp" || type === "video/3gpp2" || ext === "3gp" || ext === "3gpp") return "video/3gpp";
  return "video/mp4";
}

export function studentMediaExtension(
  contentType: string,
  fileName: string,
  kind: StudentMediaKind,
): string {
  const fromName = fileExtension(fileName);
  if (kind === "image") {
    if (fromName === "png" || fromName === "webp" || fromName === "jpg" || fromName === "jpeg") {
      return fromName === "jpeg" ? "jpg" : fromName;
    }
    return contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  }
  if (fromName === "webm" || fromName === "mov" || fromName === "mp4" || fromName === "m4v") return fromName;
  if (fromName === "3gp" || fromName === "3gpp") return "3gp";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("quicktime") || contentType.includes("hevc")) return "mov";
  if (contentType.includes("3gpp")) return "3gp";
  if (contentType.includes("m4v")) return "m4v";
  return "mp4";
}

export function assertStudentMediaConstraints(params: {
  kind: StudentMediaKind;
  size: number;
  durationSeconds?: number | null;
}): void {
  if (params.size > studentMediaMaxBytes(params.kind)) {
    throw new Error("file_too_large");
  }
  if (params.kind !== "video") return;
  const duration = params.durationSeconds;
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
    return;
  }
  if (duration > STUDENT_MEDIA_VIDEO_MAX_SECONDS + 0.25) {
    throw new Error("video_too_long");
  }
}
