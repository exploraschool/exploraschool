"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { StudentMediaItem } from "@/lib/student-media";

export function StudentMediaUploader() {
  const t = useTranslations("account");
  const [media, setMedia] = useState<StudentMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
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
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/cuenta/media", { method: "POST", body: form });
        const payload = (await res.json().catch(() => null)) as {
          media?: StudentMediaItem;
          publishedToGallery?: boolean;
          error?: string;
        } | null;
        if (!res.ok || !payload?.media) {
          throw new Error(
            payload?.error === "file_too_large"
              ? t("mediaTooLarge")
              : payload?.error === "media_limit"
                ? t("mediaLimit")
                : t("errors.save"),
          );
        }
        uploaded.push(payload.media);
        if (payload.publishedToGallery) {
          setMessage(t("mediaPublished"));
        } else {
          setMessage(t("mediaUploadedOnly"));
        }
      }
      setMedia((current) => [...uploaded, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusy(false);
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
              <div className="space-y-1 px-3 py-2 text-xs text-muted">
                <p>
                  {item.kind === "video" ? t("downloadVideo") : t("downloadPhoto")}
                  {item.publishedToGallery ? ` · ${t("mediaInGallery")}` : ""}
                </p>
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
