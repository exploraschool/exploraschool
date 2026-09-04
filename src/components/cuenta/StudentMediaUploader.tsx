"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  STUDENT_MEDIA_VIDEO_MAX_SECONDS,
  type StudentMediaItem,
} from "@/lib/student-media-shared";

function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("invalid_duration"));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid_duration"));
    };
    video.src = url;
  });
}

export function StudentMediaUploader() {
  const t = useTranslations("account");
  const [media, setMedia] = useState<StudentMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const uploaded: StudentMediaItem[] = [];
      for (const file of [...files].slice(0, 3)) {
        const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
        let durationSeconds: number | undefined;
        if (isVideo) {
          try {
            durationSeconds = await readVideoDurationSeconds(file);
          } catch {
            throw new Error(t("mediaVideoInvalid"));
          }
          if (durationSeconds > STUDENT_MEDIA_VIDEO_MAX_SECONDS + 0.25) {
            throw new Error(t("mediaVideoTooLong", { seconds: STUDENT_MEDIA_VIDEO_MAX_SECONDS }));
          }
        }

        const form = new FormData();
        form.set("file", file);
        if (durationSeconds != null) {
          form.set("durationSeconds", String(durationSeconds));
        }
        const res = await fetch("/api/cuenta/media", { method: "POST", body: form });
        const payload = (await res.json().catch(() => null)) as {
          media?: StudentMediaItem;
          error?: string;
        } | null;
        if (!res.ok || !payload?.media) {
          throw new Error(
            payload?.error === "file_too_large"
              ? t("mediaTooLarge")
              : payload?.error === "media_limit"
                ? t("mediaLimit")
                : payload?.error === "video_too_long"
                  ? t("mediaVideoTooLong", { seconds: STUDENT_MEDIA_VIDEO_MAX_SECONDS })
                  : t("errors.save"),
          );
        }
        uploaded.push(payload.media);
      }
      setMedia((current) => [...uploaded, ...current]);
      setMessage(t("mediaUploadedOnly"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusy(false);
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

  return (
    <section className="rounded-2xl border border-hielo/10 bg-white p-5">
      <h2 className="font-display text-xl text-hielo">{t("mediaTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("mediaLead")}</p>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-hielo/20 bg-nieve px-4 py-2 text-sm font-semibold text-hielo">
        {busy ? t("mediaUploading") : t("mediaUpload")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            void onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-hielo">{message}</p> : null}

      {media.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-hielo/10">
              {item.kind === "video" ? (
                <video src={item.src} controls className="aspect-video w-full bg-nieve object-cover" />
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
