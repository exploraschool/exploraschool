"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { LiveGalleryPhoto } from "@/lib/live-gallery-shared";
import {
  LIVE_GALLERY_MAX_PHOTOS,
  LIVE_GALLERY_MAX_UPLOAD_BATCH,
} from "@/lib/live-gallery-shared";

type GalleryAdminManagerProps = {
  initialPhotos: LiveGalleryPhoto[];
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GalleryAdminManager({ initialPhotos }: GalleryAdminManagerProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [altEs, setAltEs] = useState("");
  const [altEn, setAltEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function uploadOne(
    file: File,
    altEsValue: string,
    altEnValue: string,
  ): Promise<LiveGalleryPhoto> {
    const form = new FormData();
    form.append("files", file);
    if (altEsValue) form.set("altEs", altEsValue);
    if (altEnValue) form.set("altEn", altEnValue);

    const res = await fetch("/api/admin/gallery", { method: "POST", body: form });
    let data: { photos?: LiveGalleryPhoto[]; photo?: LiveGalleryPhoto; error?: string } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      /* non-JSON (often body too large / gateway) */
    }

    if (!res.ok) {
      if (res.status === 413) {
        throw new Error(`${file.name}: archivo demasiado grande para el servidor`);
      }
      throw new Error(data.error || `No se pudo subir ${file.name} (${res.status})`);
    }

    const photo = data.photos?.[0] ?? data.photo;
    if (!photo) {
      throw new Error(`Respuesta vacía al subir ${file.name}`);
    }
    return photo;
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setProgress(null);

    const selected = Array.from(fileRef.current?.files ?? []);
    if (selected.length === 0) {
      setError("Elige una o varias fotos primero.");
      return;
    }

    if (selected.length > LIVE_GALLERY_MAX_UPLOAD_BATCH) {
      setError(`Máximo ${LIVE_GALLERY_MAX_UPLOAD_BATCH} fotos por subida.`);
      return;
    }

    const slotsLeft = LIVE_GALLERY_MAX_PHOTOS - photos.length;
    if (slotsLeft <= 0) {
      setError(`Máximo ${LIVE_GALLERY_MAX_PHOTOS} fotos.`);
      return;
    }

    if (selected.length > slotsLeft) {
      setError(
        `Solo caben ${slotsLeft} foto${slotsLeft === 1 ? "" : "s"} más (máximo ${LIVE_GALLERY_MAX_PHOTOS}).`,
      );
      return;
    }

    const oversized = selected.filter((file) => file.size > 6 * 1024 * 1024);
    if (oversized.length > 0) {
      setError(
        `Estas fotos superan 6 MB: ${oversized.map((f) => `${f.name} (${formatBytes(f.size)})`).join(", ")}`,
      );
      return;
    }

    const altEsValue = altEs.trim();
    const altEnValue = altEn.trim();

    setBusy(true);
    const uploaded: LiveGalleryPhoto[] = [];
    const failures: string[] = [];

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        setProgress(`Subiendo ${i + 1} de ${selected.length}: ${file.name}`);
        try {
          const photo = await uploadOne(file, altEsValue, altEnValue);
          uploaded.push(photo);
          setPhotos((prev) => [...prev, photo]);
        } catch (err) {
          failures.push(err instanceof Error ? err.message : `Error con ${file.name}`);
        }
      }

      if (uploaded.length > 0) {
        setAltEs("");
        setAltEn("");
        if (fileRef.current) fileRef.current.value = "";
        setOk(
          uploaded.length === 1
            ? "Foto subida. Ya aparece en «La estación, en directo»."
            : `${uploaded.length} fotos subidas. Ya aparecen en «La estación, en directo».`,
        );
        router.refresh();
      }

      if (failures.length > 0) {
        setError(
          uploaded.length > 0
            ? `Subidas ${uploaded.length}. Fallaron: ${failures.join(" · ")}`
            : failures.join(" · "),
        );
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta foto de la web?")) return;
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar");
      }
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
      setOk("Foto eliminada.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-hielo/10 bg-white p-5 shadow-[0_4px_24px_rgba(10,18,25,0.04)] sm:p-6"
      >
        <h2 className="font-display text-xl font-semibold text-hielo">Subir fotos</h2>
        <p className="mt-1 text-sm text-muted">
          JPG, PNG o WebP · máx. 6 MB cada una · hasta {LIVE_GALLERY_MAX_UPLOAD_BATCH} a la vez
          (se suben una por una) · {LIVE_GALLERY_MAX_PHOTOS} en total en la sección.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="gallery-file" className="mb-1.5 block text-sm font-medium text-pizarra">
              Archivos * (hasta {LIVE_GALLERY_MAX_UPLOAD_BATCH})
            </label>
            <input
              id="gallery-file"
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              required
              disabled={busy}
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-hielo file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          <div>
            <label htmlFor="gallery-alt-es" className="mb-1.5 block text-sm font-medium text-pizarra">
              Texto alternativo (ES)
            </label>
            <input
              id="gallery-alt-es"
              value={altEs}
              onChange={(e) => setAltEs(e.target.value)}
              disabled={busy}
              placeholder="Sierra Nevada en directo"
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="gallery-alt-en" className="mb-1.5 block text-sm font-medium text-pizarra">
              Texto alternativo (EN)
            </label>
            <input
              id="gallery-alt-en"
              value={altEn}
              onChange={(e) => setAltEn(e.target.value)}
              disabled={busy}
              placeholder="Sierra Nevada live"
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm"
            />
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary mt-5 !w-auto disabled:opacity-50">
          {busy ? progress ?? "Subiendo…" : "Subir a la web"}
        </button>

        {progress && !error ? <p className="mt-3 text-sm text-muted">{progress}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-accent">{error}</p> : null}
        {ok ? <p className="mt-3 text-sm font-medium text-hielo">{ok}</p> : null}
      </form>

      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-hielo">Fotos publicadas</h2>
            <p className="mt-1 text-sm text-muted">
              {photos.length === 0
                ? "Sin fotos subidas: la home muestra las imágenes por defecto."
                : `${photos.length} foto${photos.length === 1 ? "" : "s"} en «La estación, en directo».`}
            </p>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hielo/20 bg-white/70 px-5 py-10 text-center text-sm text-muted">
            Todavía no hay fotos propias. Sube la primera para sustituir las de stock.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_2px_16px_rgba(10,18,25,0.04)]"
              >
                <div className="relative aspect-[4/3] bg-hielo/5">
                  <Image src={photo.src} alt={photo.altEs} fill className="object-cover" sizes="320px" unoptimized />
                </div>
                <div className="space-y-2 p-4">
                  <p className="line-clamp-2 text-sm text-pizarra">{photo.altEs}</p>
                  <p className="line-clamp-1 text-xs text-muted">{photo.altEn}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(photo.id)}
                    className="rounded-full border border-accent/25 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/5 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
