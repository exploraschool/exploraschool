"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  normalizeStudentMediaContentType,
  resolveStudentMediaKind,
  STUDENT_MEDIA_PROXY_FALLBACK_MAX_BYTES,
  STUDENT_MEDIA_VIDEO_MAX_BYTES,
  STUDENT_MEDIA_VIDEO_MAX_SECONDS,
  type StudentMediaItem,
} from "@/lib/student-media-shared";

function readVideoDurationSeconds(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("muted", "true");
    video.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;opacity:0";
    document.body.appendChild(video);

    let settled = false;
    const finish = (value?: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      resolve(value);
    };

    const acceptIfReady = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) finish(duration);
    };

    const timer = window.setTimeout(() => finish(undefined), 8000);

    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration === Infinity) {
        try {
          video.currentTime = 1e16;
        } catch {
          finish(undefined);
        }
        return;
      }
      acceptIfReady();
    };
    video.ondurationchange = acceptIfReady;
    video.ontimeupdate = acceptIfReady;
    video.onerror = () => finish(undefined);
    video.src = url;
    video.load();
  });
}

function putFileToSignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("upload_failed"));
    };
    xhr.onerror = () => reject(new Error("upload_failed"));
    xhr.send(file);
  });
}

type ApiErrorPayload = { media?: StudentMediaItem; error?: string };

export function StudentMediaUploader({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("account");
  const [media, setMedia] = useState<StudentMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const maxVideoMb = Math.round(STUDENT_MEDIA_VIDEO_MAX_BYTES / (1024 * 1024));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cuenta/media")
      .then((res) => res.json())
      .then((payload: { media?: StudentMediaItem[] }) => {
        if (!cancelled) setMedia(payload.media ?? []);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function errorFromCode(code?: string): string {
    if (code === "file_too_large") return t("mediaTooLarge", { mb: maxVideoMb });
    if (code === "media_limit") return t("mediaLimit");
    if (code === "video_too_long") {
      return t("mediaVideoTooLong", { seconds: STUDENT_MEDIA_VIDEO_MAX_SECONDS });
    }
    if (code === "invalid_type") return t("mediaInvalidType");
    return t("mediaUploadFailed");
  }

  async function uploadViaApi(file: File, durationSeconds?: number): Promise<StudentMediaItem> {
    const form = new FormData();
    form.set("file", file);
    if (durationSeconds != null) form.set("durationSeconds", String(durationSeconds));
    const res = await fetch("/api/cuenta/media", { method: "POST", body: form });
    const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
    if (!res.ok || !payload?.media) throw new Error(errorFromCode(payload?.error));
    return payload.media;
  }

  async function uploadFile(
    file: File,
    preferredKind: "image" | "video",
  ): Promise<StudentMediaItem> {
    const kind = resolveStudentMediaKind(file.type, file.name) ?? preferredKind;
    const fileName = file.name || (kind === "video" ? "video.mov" : "photo.jpg");

    let durationSeconds: number | undefined;
    if (kind === "video") {
      durationSeconds = await readVideoDurationSeconds(file);
      if (
        durationSeconds != null &&
        durationSeconds > STUDENT_MEDIA_VIDEO_MAX_SECONDS + 0.25
      ) {
        throw new Error(t("mediaVideoTooLong", { seconds: STUDENT_MEDIA_VIDEO_MAX_SECONDS }));
      }
    }

    const contentType = normalizeStudentMediaContentType(file.type, fileName, kind);
    const preparedRes = await fetch("/api/cuenta/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        contentType,
        size: file.size,
        durationSeconds: durationSeconds ?? null,
      }),
    });
    const prepared = (await preparedRes.json().catch(() => null)) as {
      uploadUrl?: string;
      mediaId?: string;
      storagePath?: string;
      contentType?: string;
      error?: string;
    } | null;

    if (preparedRes.ok && prepared?.uploadUrl && prepared.mediaId && prepared.storagePath) {
      try {
        await putFileToSignedUrl(prepared.uploadUrl, file, prepared.contentType || contentType, setProgress);
        const completeRes = await fetch("/api/cuenta/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "complete",
            mediaId: prepared.mediaId,
            storagePath: prepared.storagePath,
            contentType: prepared.contentType || contentType,
            fileName,
            durationSeconds: durationSeconds ?? null,
          }),
        });
        const complete = (await completeRes.json().catch(() => null)) as ApiErrorPayload | null;
        if (!completeRes.ok || !complete?.media) throw new Error(errorFromCode(complete?.error));
        return complete.media;
      } catch (err) {
        if (file.size <= STUDENT_MEDIA_PROXY_FALLBACK_MAX_BYTES) {
          return uploadViaApi(file, durationSeconds);
        }
        throw err instanceof Error && err.message && err.message !== "upload_failed"
          ? err
          : new Error(t("mediaUploadFailed"));
      }
    }

    if (file.size <= STUDENT_MEDIA_PROXY_FALLBACK_MAX_BYTES) {
      return uploadViaApi(file, durationSeconds);
    }
    throw new Error(errorFromCode(prepared?.error));
  }

  async function onFiles(files: FileList | null, preferredKind: "image" | "video") {
    if (!files?.length) return;
    setBusy(true);
    setProgress(null);
    setError("");
    setMessage("");
    try {
      const uploaded: StudentMediaItem[] = [];
      for (const file of [...files].slice(0, preferredKind === "video" ? 1 : 3)) {
        setProgress(0);
        uploaded.push(await uploadFile(file, preferredKind));
      }
      setMedia((current) => [...uploaded, ...current]);
      setMessage(t("mediaUploadedOnly"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function setGalleryVisibility(mediaId: string, publish: boolean) {
    setBusyId(mediaId);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/cuenta/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, action: publish ? "publish" : "unpublish" }),
      });
      const payload = (await res.json().catch(() => null)) as {
        media?: StudentMediaItem;
        error?: string;
      } | null;
      if (!res.ok || !payload?.media) {
        throw new Error(
          payload?.error === "gallery_full"
            ? t("mediaGalleryFull")
            : payload?.error === "videos_not_allowed"
              ? t("mediaVideoNoGallery")
              : t("errors.save"),
        );
      }
      setMedia((current) => current.map((item) => (item.id === mediaId ? payload.media! : item)));
      setMessage(publish ? t("mediaPublished") : t("mediaUnpublished"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusyId(null);
    }
  }

  const uploadLabelClass =
    "inline-flex cursor-pointer items-center gap-2 rounded-full border border-hielo/20 bg-nieve px-4 py-2 text-sm font-semibold text-hielo disabled:opacity-50";

  return (
    <section className={embedded ? "" : "rounded-2xl border border-hielo/10 bg-white p-5"}>
      {embedded ? null : <h2 className="font-display text-xl text-hielo">{t("mediaTitle")}</h2>}
      <p className={embedded ? "text-sm text-muted" : "mt-1 text-sm text-muted"}>
        {t("mediaLead", { mb: maxVideoMb })}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className={uploadLabelClass}>
          {busy ? t("mediaUploading") : t("mediaUploadPhoto")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              void onFiles(event.target.files, "image");
              event.target.value = "";
            }}
          />
        </label>
        <label className={uploadLabelClass}>
          {busy ? t("mediaUploading") : t("mediaUploadVideo")}
          <input
            type="file"
            accept="video/*,.mp4,.mov,.m4v,.webm,.3gp,.3gpp"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              void onFiles(event.target.files, "video");
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {busy && progress != null ? (
        <p className="mt-2 text-sm text-muted">{t("mediaUploadingProgress", { percent: progress })}</p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-hielo">{message}</p> : null}

      {media.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-hielo/10">
              {item.kind === "video" ? (
                <video
                  src={item.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-nieve object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="space-y-2 px-3 py-2 text-xs text-muted">
                <p>
                  {item.kind === "video" ? t("downloadVideo") : t("downloadPhoto")}
                  {item.publishedToGallery ? ` · ${t("mediaInGallery")}` : ""}
                </p>
                {item.kind === "image" ? (
                  item.publishedToGallery ? (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void setGalleryVisibility(item.id, false)}
                      className="rounded-full border border-hielo/20 px-3 py-1.5 text-xs font-semibold text-hielo disabled:opacity-50"
                    >
                      {busyId === item.id ? t("mediaUploading") : t("mediaHideGallery")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void setGalleryVisibility(item.id, true)}
                      className="rounded-full bg-hielo px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyId === item.id ? t("mediaUploading") : t("mediaShowGallery")}
                    </button>
                  )
                ) : (
                  <p className="text-muted">{t("mediaVideoNoGallery")}</p>
                )}
                {item.correctionNotes ? (
                  <p className="whitespace-pre-wrap text-sm text-pizarra">
                    <span className="font-semibold text-hielo">{t("mediaCorrection")}: </span>
                    {item.correctionNotes}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">{t("mediaEmpty")}</p>
      )}
    </section>
  );
}
