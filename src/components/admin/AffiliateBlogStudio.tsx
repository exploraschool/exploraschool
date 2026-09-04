"use client";

import { useRouter } from "next/navigation";
import { Component, useMemo, useState, type ReactNode } from "react";
import { AffiliatePostView } from "@/components/AffiliatePostView";
import {
  productGallery,
  productImageLimits,
  productMeetsImageRequirement,
  type AffiliateBlogPost,
  type AffiliatePostType,
} from "@/lib/affiliate-blog-shared";
import {
  prepareImageForUpload,
  putFileToSignedUrl,
} from "@/lib/affiliate-image-client";

class StudioPreviewBoundary extends Component<{ children: ReactNode }, { message: string }> {
  state = { message: "" };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : "Error en el preview" };
  }

  render() {
    if (this.state.message) {
      return (
        <p className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
          No se pudo mostrar el preview ({this.state.message}). Recarga la página o vuelve a generar el borrador.
        </p>
      );
    }
    return this.props.children;
  }
}

function isReady(post: AffiliateBlogPost): boolean {
  return (post.products ?? []).every(
    (product) => product.affiliateUrl && productMeetsImageRequirement(product, post.type),
  );
}

function missingPhotosLabel(post: AffiliateBlogPost): string {
  if (post.type === "review") {
    const count = post.products[0] ? productGallery(post.products[0]).length : 0;
    const need = productImageLimits("review").min;
    return `La review necesita ${need} fotos. Ahora hay ${count}. Sube las que falten.`;
  }
  const missing = post.products.filter(
    (product) => !product.affiliateUrl || !productMeetsImageRequirement(product, "ranking"),
  ).length;
  return `Falta URL o foto en ${missing} producto${missing === 1 ? "" : "s"} del ranking.`;
}

export function AffiliateBlogStudio({ initialPost }: { initialPost: AffiliateBlogPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [urlDrafts, setUrlDrafts] = useState(() =>
    initialPost.products.map((product) => product.affiliateUrl),
  );
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [localePreview, setLocalePreview] = useState<"es" | "en">("es");

  const ready = useMemo(() => isReady(post), [post]);
  const generated = Boolean(post.titleEs);

  async function captureUrl(index: number, rawUrl?: string) {
    const url = (rawUrl ?? urlDrafts[index])?.trim();
    if (!url) return;
    setBusyIndex(index);
    setError("");
    try {
      const res = await fetch(`/api/admin/affiliate-blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIndex: index, affiliateUrl: url }),
      });
      const payload = (await res.json().catch(() => null)) as { post?: AffiliateBlogPost; error?: string };
      if (!res.ok || !payload?.post) {
        throw new Error(payload?.error === "invalid_amazon_url" ? "Esa URL no parece de Amazon." : "No se pudo captar el producto.");
      }
      setPost(payload.post);
      setUrlDrafts(payload.post.products.map((item) => item.affiliateUrl));
      const captured = payload.post.products[index];
      const galleryCount = captured ? productGallery(captured).length : 0;
      const need = productImageLimits(payload.post.type).min;
      if (galleryCount === 0) {
        setError(
          payload.post.type === "review"
            ? "Amazon no trajo fotos. Sube al menos 6 imágenes de la review."
            : "Amazon no trajo foto. Sube 1 imagen para este producto.",
        );
      } else if (galleryCount < need) {
        setError(
          `Amazon trajo ${galleryCount} foto${galleryCount === 1 ? "" : "s"}. Faltan ${need - galleryCount} para llegar a ${need}.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo captar el producto.");
    } finally {
      setBusyIndex(null);
    }
  }

  async function uploadOne(index: number, file: File) {
    const prepared = await prepareImageForUpload(file);
    const putRes = await fetch(`/api/admin/affiliate-blog/${post.id}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: prepared.name || "producto.jpg",
        contentType: prepared.type || "image/jpeg",
        size: prepared.size,
        productIndex: index,
      }),
    });
    const putPayload = (await putRes.json().catch(() => null)) as {
      uploadUrl?: string;
      storagePath?: string;
      contentType?: string;
    };
    if (putRes.ok && putPayload?.uploadUrl && putPayload.storagePath) {
      try {
        await putFileToSignedUrl(
          putPayload.uploadUrl,
          prepared,
          putPayload.contentType || prepared.type,
          setProgress,
        );
        const completeRes = await fetch(`/api/admin/affiliate-blog/${post.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath: putPayload.storagePath,
            contentType: putPayload.contentType || prepared.type,
            productIndex: index,
          }),
        });
        const completePayload = (await completeRes.json().catch(() => null)) as {
          post?: AffiliateBlogPost;
        };
        if (!completeRes.ok || !completePayload?.post) throw new Error("upload_failed");
        setPost(completePayload.post);
        return;
      } catch {
        /* fallback */
      }
    }
    const form = new FormData();
    form.set("file", prepared);
    form.set("productIndex", String(index));
    const fallback = await fetch(`/api/admin/affiliate-blog/${post.id}/images`, {
      method: "POST",
      body: form,
    });
    const fallbackPayload = (await fallback.json().catch(() => null)) as { post?: AffiliateBlogPost };
    if (!fallback.ok || !fallbackPayload?.post) throw new Error("upload_failed");
    setPost(fallbackPayload.post);
  }

  async function uploadImages(index: number, files: FileList | File[]) {
    const max = productImageLimits(post.type).max;
    const already = productGallery(post.products[index] ?? post.products[0]).length;
    const remaining = Math.max(1, max - already);
    const list = [...files].slice(0, remaining);
    if (!list.length) return;
    setBusyIndex(index);
    setProgress(8);
    setError("");
    try {
      for (const file of list) {
        await uploadOne(index, file);
      }
    } catch {
      setError("No se pudo subir la foto. Prueba otra vez o elige un JPG/PNG más ligero.");
    } finally {
      setBusyIndex(null);
      setProgress(null);
    }
  }

  async function removeImage(productIndex: number, imageIndex: number) {
    setBusyIndex(productIndex);
    setError("");
    try {
      const res = await fetch(`/api/admin/affiliate-blog/${post.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIndex, imageIndex }),
      });
      const payload = (await res.json().catch(() => null)) as { post?: AffiliateBlogPost };
      if (!res.ok || !payload?.post) throw new Error("delete_failed");
      setPost(payload.post);
    } catch {
      setError("No se pudo quitar esa foto.");
    } finally {
      setBusyIndex(null);
    }
  }

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/affiliate-blog/${post.id}/generate`, { method: "POST" });
      const payload = (await res.json().catch(() => null)) as { post?: AffiliateBlogPost; error?: string };
      if (!res.ok || !payload?.post) {
        throw new Error(
          payload?.error === "not_ready"
            ? missingPhotosLabel(post)
            : "Gemini no pudo generar el borrador. Revisa Vertex o inténtalo de nuevo.",
        );
      }
      setPost(payload.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar.");
    } finally {
      setGenerating(false);
    }
  }

  async function publish(action: "publish" | "unpublish") {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/affiliate-blog/${post.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await res.json().catch(() => null)) as { post?: AffiliateBlogPost };
      if (!res.ok || !payload?.post) throw new Error("No se pudo publicar.");
      setPost(payload.post);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-8">
      {error ? (
        <p className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">{error}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {post.products.map((product, index) => {
          const gallery = productGallery(product);
          const hero = gallery[0]?.src || "";
          const limits = productImageLimits(post.type);
          const photosOk = productMeetsImageRequirement(product, post.type);
          return (
            <article key={index} className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-hielo">
                  {post.type === "ranking" ? `Producto ${index + 1}` : "Producto"}
                </p>
                {product.asin ? (
                  <span className="truncate text-[0.65rem] text-muted">{product.asin}</span>
                ) : null}
              </div>
              <label className="block text-xs font-semibold text-pizarra">URL de Amazon</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={urlDrafts[index] ?? ""}
                  onChange={(event) => {
                    const next = [...urlDrafts];
                    next[index] = event.target.value;
                    setUrlDrafts(next);
                  }}
                  onPaste={(event) => {
                    const pasted = event.clipboardData.getData("text").trim();
                    if (pasted) {
                      const next = [...urlDrafts];
                      next[index] = pasted;
                      setUrlDrafts(next);
                      window.setTimeout(() => void captureUrl(index, pasted), 0);
                    }
                  }}
                  placeholder="https://www.amazon.es/dp/..."
                  className="w-full rounded-xl border border-hielo/15 bg-nieve px-3 py-2.5 text-sm outline-none focus:border-hielo"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  disabled={busyIndex === index || !urlDrafts[index]?.trim()}
                  onClick={() => void captureUrl(index)}
                  className="shrink-0 rounded-xl bg-hielo px-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {busyIndex === index && progress == null ? "…" : "Captar"}
                </button>
              </div>
              <p className="mt-2 text-[0.7rem] text-muted">
                {post.type === "review"
                  ? `Review: mínimo ${limits.min} fotos (Amazon las trae al captar; si faltan, súbelas).`
                  : "Ranking: 1 foto por producto. Captar el enlace o súbela tú."}
              </p>
              <div className="mt-3 overflow-hidden rounded-xl bg-nieve">
                {hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hero} alt="" className="h-40 w-full bg-white object-contain" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-muted">Sin foto aún</div>
                )}
              </div>
              {gallery.length > 0 ? (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((image, imageIndex) => (
                    <div key={`${image.src}-${imageIndex}`} className="relative h-14 w-14 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.src} alt="" className="h-14 w-14 rounded-lg bg-white object-contain ring-1 ring-hielo/10" />
                      <button
                        type="button"
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
                        onClick={() => void removeImage(index, imageIndex)}
                        aria-label="Quitar foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-hielo/20 bg-white text-sm font-semibold text-hielo">
                {busyIndex === index
                  ? progress != null
                    ? `Subiendo ${progress}%`
                    : "Captando Amazon…"
                  : gallery.length
                    ? post.type === "review"
                      ? photosOk
                        ? `Añadir o cambiar fotos (${gallery.length}/${limits.max})`
                        : `Faltan ${limits.min - gallery.length} fotos (${gallery.length}/${limits.min})`
                      : "Cambiar foto"
                    : post.type === "review"
                      ? "Subir las 6 fotos"
                      : "Subir foto"}
                <input
                  type="file"
                  multiple={post.type === "review"}
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  className="sr-only"
                  onChange={(event) => {
                    const files = event.target.files;
                    event.target.value = "";
                    if (files?.length) void uploadImages(index, files);
                  }}
                />
              </label>
              {product.nameEs ? (
                <p className="mt-2 line-clamp-2 text-sm font-medium text-pizarra">{product.nameEs}</p>
              ) : null}
              <p className="mt-1 text-[0.7rem] text-muted">
                {[
                  product.brand,
                  product.priceText,
                  product.rating,
                  gallery.length ? `${gallery.length} fotos` : "",
                  product.amazonBullets.length ? `${product.amazonBullets.length} specs Amazon` : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </article>
          );
        })}
      </div>

      {generated ? (
        <section className="rounded-2xl border border-hielo/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-hielo">Preview</h2>
            <div className="flex rounded-full border border-hielo/15 p-0.5 text-xs font-semibold">
              <button
                type="button"
                className={`rounded-full px-3 py-1 ${localePreview === "es" ? "bg-hielo text-white" : "text-muted"}`}
                onClick={() => setLocalePreview("es")}
              >
                ES
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 ${localePreview === "en" ? "bg-hielo text-white" : "text-muted"}`}
                onClick={() => setLocalePreview("en")}
              >
                EN
              </button>
            </div>
          </div>
          <div className="mt-6">
            <StudioPreviewBoundary>
              <AffiliatePostView post={post} locale={localePreview} />
            </StudioPreviewBoundary>
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hielo/10 bg-white/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={!ready || generating}
            onClick={() => void generate()}
            className="btn-primary !w-full sm:!w-auto"
          >
            {generating ? "Escribiendo con Gemini…" : generated ? "Volver a generar" : "Generar borrador"}
          </button>
          {generated ? (
            <button
              type="button"
              disabled={publishing}
              onClick={() => void publish(post.status === "published" ? "unpublish" : "publish")}
              className="btn-secondary !w-full sm:!w-auto"
            >
              {publishing
                ? "Guardando…"
                : post.status === "published"
                  ? "Despublicar"
                  : "Publicar en el blog"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CreateAffiliateButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<AffiliatePostType | null>(null);
  const [error, setError] = useState("");

  async function create(type: AffiliatePostType) {
    setBusy(type);
    setError("");
    try {
      const res = await fetch("/api/admin/affiliate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const payload = (await res.json().catch(() => null)) as { post?: AffiliateBlogPost };
      if (!res.ok || !payload?.post) throw new Error("No se pudo crear.");
      router.push(`/admin/blog/${payload.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear.");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void create("ranking")}
          className="rounded-2xl border border-hielo/15 bg-white p-5 text-left shadow-sm transition hover:border-hielo/40"
        >
          <p className="font-display text-xl font-semibold text-hielo">Ranking de 6</p>
          <p className="mt-1 text-sm text-muted">
            {busy === "ranking" ? "Creando…" : "Seis URLs y una foto por producto."}
          </p>
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void create("review")}
          className="rounded-2xl border border-hielo/15 bg-white p-5 text-left shadow-sm transition hover:border-hielo/40"
        >
          <p className="font-display text-xl font-semibold text-hielo">Review</p>
          <p className="mt-1 text-sm text-muted">
            {busy === "review" ? "Creando…" : "Un producto y al menos 6 fotos."}
          </p>
        </button>
      </div>
    </div>
  );
}

export function AffiliatePostDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="text-xs font-semibold text-accent hover:underline"
      onClick={async () => {
        if (!window.confirm("¿Borrar esta entrada?")) return;
        setBusy(true);
        await fetch(`/api/admin/affiliate-blog/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      {busy ? "…" : "Borrar"}
    </button>
  );
}
