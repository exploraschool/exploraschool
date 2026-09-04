/** Shared student-media limits (safe for client + server). */

export const STUDENT_MEDIA_MAX_PER_USER = 24;
export const STUDENT_MEDIA_IMAGE_MAX_BYTES = 6 * 1024 * 1024;
export const STUDENT_MEDIA_VIDEO_MAX_BYTES = 40 * 1024 * 1024;
/** Max duration for student correction videos (seconds). */
export const STUDENT_MEDIA_VIDEO_MAX_SECONDS = 30;

export const STUDENT_MEDIA_COLLECTION = "studentMedia";
export const STUDENT_MEDIA_STORAGE_PREFIX = "student-media";

export type StudentMediaKind = "image" | "video";

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
