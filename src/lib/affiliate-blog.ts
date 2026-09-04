import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { publicStorageUrl } from "@/lib/live-gallery-shared";
import { ensureDirectUploadCors } from "@/lib/storage-cors";
import { blogSlugs } from "@/data/blog";
import type { AmazonProductMeta } from "@/lib/amazon-product-meta";
import { parseExploraScore } from "@/lib/blog-article";
import {
  AFFILIATE_BLOG_COLLECTION,
  AFFILIATE_BLOG_MAX_IMAGE_BYTES,
  AFFILIATE_BLOG_STORAGE_PREFIX,
  emptyProduct,
  emptyProductImage,
  mergeProductImages,
  appendProductImage,
  primaryProductImage,
  productGallery,
  productImageLimits,
  productMeetsImageRequirement,
  productSlotCount,
  slugifyAffiliateTitle,
  withPrimaryImage,
  type AffiliateBlogPost,
  type AffiliatePostType,
  type AffiliateProduct,
  type AffiliateProductImage,
  type AffiliateSection,
  type AffiliateSpec,
} from "@/lib/affiliate-blog-shared";

export {
  AFFILIATE_BLOG_COLLECTION,
  AFFILIATE_BLOG_MAX_IMAGE_BYTES,
  AFFILIATE_BLOG_STORAGE_PREFIX,
  AFFILIATE_MAX_PRODUCT_IMAGES,
  emptyProduct,
  emptyProductImage,
  mergeProductImages,
  primaryProductImage,
  productGallery,
  productImageLimits,
  productMeetsImageRequirement,
  productSlotCount,
  slugifyAffiliateTitle,
  withPrimaryImage,
  type AffiliateBlogPost,
  type AffiliateFaq,
  type AffiliateInternalLink,
  type AffiliateAlternative,
  type AffiliatePostStatus,
  type AffiliatePostType,
  type AffiliateProduct,
  type AffiliateProductImage,
  type AffiliateSection,
} from "@/lib/affiliate-blog-shared";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseImage(raw: Record<string, unknown>): AffiliateProductImage | null {
  const src = asString(raw.src);
  if (!src) return null;
  return {
    src,
    storagePath: asString(raw.storagePath),
    source: raw.source === "upload" ? "upload" : "amazon",
    altEs: asString(raw.altEs),
    altEn: asString(raw.altEn),
    captionEs: asString(raw.captionEs),
    captionEn: asString(raw.captionEn),
  };
}

function parseSpecs(value: unknown): AffiliateSpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        labelEs: asString(item.labelEs),
        labelEn: asString(item.labelEn),
        valueEs: asString(item.valueEs),
        valueEn: asString(item.valueEn),
      };
    })
    .filter((item) => item.labelEs || item.labelEn);
}

function parseSections(value: unknown): AffiliateSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        headingEs: asString(item.headingEs),
        headingEn: asString(item.headingEn),
        bodyEs: asString(item.bodyEs),
        bodyEn: asString(item.bodyEn),
      };
    })
    .filter((item) => item.headingEs || item.bodyEs);
}

export function parseAffiliatePost(id: string, data: Record<string, unknown>): AffiliateBlogPost {
  const type: AffiliatePostType = data.type === "review" ? "review" : "ranking";
  const slots = productSlotCount(type);
  const rawProducts = Array.isArray(data.products) ? data.products : [];
  const products = Array.from({ length: slots }, (_, index) => {
    const raw = rawProducts[index] as Record<string, unknown> | undefined;
    const base = emptyProduct(index);
    if (!raw) return base;
    const parsedImages = Array.isArray(raw.images)
      ? raw.images
          .map((item) => parseImage((item ?? {}) as Record<string, unknown>))
          .filter((item): item is AffiliateProductImage => Boolean(item))
      : [];
    const fallbackSrc = asString(raw.imageSrc);
    const images =
      parsedImages.length > 0
        ? parsedImages
        : fallbackSrc
          ? [emptyProductImage(fallbackSrc, raw.imageSource === "amazon" ? "amazon" : "upload", asString(raw.imageStoragePath))]
          : [];
    return withPrimaryImage({
      ...base,
      index,
      affiliateUrl: asString(raw.affiliateUrl),
      asin: asString(raw.asin),
      brand: asString(raw.brand),
      imageSrc: asString(raw.imageSrc),
      imageStoragePath: asString(raw.imageStoragePath),
      imageSource: raw.imageSource === "amazon" ? "amazon" : "upload",
      images,
      altEs: asString(raw.altEs),
      altEn: asString(raw.altEn),
      captionEs: asString(raw.captionEs),
      captionEn: asString(raw.captionEn),
      nameEs: asString(raw.nameEs),
      nameEn: asString(raw.nameEn),
      priceText: asString(raw.priceText),
      rating: asString(raw.rating),
      reviewCount: asString(raw.reviewCount),
      amazonBullets: asStringArray(raw.amazonBullets),
      amazonDescription: asString(raw.amazonDescription),
      summaryEs: asString(raw.summaryEs),
      summaryEn: asString(raw.summaryEn),
      bodyEs: asString(raw.bodyEs),
      bodyEn: asString(raw.bodyEn),
      onSnowEs: asString(raw.onSnowEs),
      onSnowEn: asString(raw.onSnowEn),
      forWhomEs: asString(raw.forWhomEs),
      forWhomEn: asString(raw.forWhomEn),
      skipIfEs: asString(raw.skipIfEs),
      skipIfEn: asString(raw.skipIfEn),
      specs: parseSpecs(raw.specs),
      prosEs: asStringArray(raw.prosEs),
      consEs: asStringArray(raw.consEs),
      prosEn: asStringArray(raw.prosEn),
      consEn: asStringArray(raw.consEn),
      ctaLabelEs: asString(raw.ctaLabelEs, base.ctaLabelEs),
      ctaLabelEn: asString(raw.ctaLabelEn, base.ctaLabelEn),
      pickRoleEs: asString(raw.pickRoleEs),
      pickRoleEn: asString(raw.pickRoleEn),
    });
  });

  return {
    id,
    type,
    status: data.status === "published" ? "published" : "draft",
    slug: asString(data.slug),
    titleEs: asString(data.titleEs),
    titleEn: asString(data.titleEn),
    excerptEs: asString(data.excerptEs),
    excerptEn: asString(data.excerptEn),
    coverImage: asString(data.coverImage),
    coverAltEs: asString(data.coverAltEs),
    coverAltEn: asString(data.coverAltEn),
    introEs: asString(data.introEs),
    introEn: asString(data.introEn),
    verdictEs: asString(data.verdictEs),
    verdictEn: asString(data.verdictEn),
    score: parseExploraScore(
      typeof data.score === "number" || typeof data.score === "string" ? data.score : undefined,
    ),
    tldrBestEs: asString(data.tldrBestEs),
    tldrBestEn: asString(data.tldrBestEn),
    tldrWorstEs: asString(data.tldrWorstEs),
    tldrWorstEn: asString(data.tldrWorstEn),
    instructorNoteEs: asString(data.instructorNoteEs),
    instructorNoteEn: asString(data.instructorNoteEn),
    methodologyEs: asString(data.methodologyEs),
    methodologyEn: asString(data.methodologyEn),
    howToChooseEs: asString(data.howToChooseEs),
    howToChooseEn: asString(data.howToChooseEn),
    sections: parseSections(data.sections),
    winnerIndex: typeof data.winnerIndex === "number" ? data.winnerIndex : 0,
    products,
    comparison: Array.isArray(data.comparison)
      ? data.comparison
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              labelEs: asString(item.labelEs),
              labelEn: asString(item.labelEn),
              values: asStringArray(item.values),
            };
          })
          .filter((row) => row.labelEs || row.labelEn)
      : [],
    faq: Array.isArray(data.faq)
      ? data.faq
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              qEs: asString(item.qEs),
              qEn: asString(item.qEn),
              aEs: asString(item.aEs),
              aEn: asString(item.aEn),
            };
          })
          .filter((row) => row.qEs || row.qEn)
      : [],
    internalLinks: Array.isArray(data.internalLinks)
      ? data.internalLinks
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              href: asString(item.href),
              labelEs: asString(item.labelEs),
              labelEn: asString(item.labelEn),
            };
          })
          .filter((row) => row.href.startsWith("/"))
      : [],
    alternatives: Array.isArray(data.alternatives)
      ? data.alternatives
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              titleEs: asString(item.titleEs),
              titleEn: asString(item.titleEn),
              whyEs: asString(item.whyEs),
              whyEn: asString(item.whyEn),
              href: asString(item.href),
            };
          })
          .filter((row) => row.titleEs && row.href.startsWith("/"))
      : [],
    seoTitleEs: asString(data.seoTitleEs),
    seoTitleEn: asString(data.seoTitleEn),
    seoDescriptionEs: asString(data.seoDescriptionEs),
    seoDescriptionEn: asString(data.seoDescriptionEn),
    relatedSlugs: asStringArray(data.relatedSlugs),
    createdAt: asString(data.createdAt),
    updatedAt: asString(data.updatedAt),
    publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : null,
    createdBy: asString(data.createdBy),
  };
}

export function revalidateAffiliateBlog(slug?: string) {
  revalidatePath("/es/blog");
  revalidatePath("/en/blog");
  revalidatePath("/es");
  revalidatePath("/en");
  if (slug) {
    revalidatePath(`/es/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
  }
}

export async function listAffiliatePosts(): Promise<AffiliateBlogPost[]> {
  if (!isAdminConfigured()) return [];
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db.collection(AFFILIATE_BLOG_COLLECTION).get();
  return snap.docs
    .flatMap((doc) => {
      try {
        return [parseAffiliatePost(doc.id, doc.data() as Record<string, unknown>)];
      } catch (error) {
        console.error("[affiliate-blog] parse failed", doc.id, error);
        return [];
      }
    })
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function listPublishedAffiliatePosts(): Promise<AffiliateBlogPost[]> {
  const posts = await listAffiliatePosts();
  return posts
    .filter((post) => post.status === "published" && post.slug)
    .sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
}

export async function getAffiliatePost(id: string): Promise<AffiliateBlogPost | null> {
  if (!isAdminConfigured()) return null;
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection(AFFILIATE_BLOG_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return parseAffiliatePost(snap.id, snap.data() as Record<string, unknown>);
}

export async function getPublishedAffiliatePostBySlug(
  slug: string,
): Promise<AffiliateBlogPost | null> {
  const posts = await listPublishedAffiliatePosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function createAffiliatePost(
  type: AffiliatePostType,
  createdBy: string,
): Promise<AffiliateBlogPost> {
  const db = getAdminDb();
  if (!db) throw new Error("unavailable");
  const now = new Date().toISOString();
  const ref = db.collection(AFFILIATE_BLOG_COLLECTION).doc();
  const post: AffiliateBlogPost = {
    id: ref.id,
    type,
    status: "draft",
    slug: "",
    titleEs: "",
    titleEn: "",
    excerptEs: "",
    excerptEn: "",
    coverImage: "",
    coverAltEs: "",
    coverAltEn: "",
    introEs: "",
    introEn: "",
    verdictEs: "",
    verdictEn: "",
    score: 0,
    tldrBestEs: "",
    tldrBestEn: "",
    tldrWorstEs: "",
    tldrWorstEn: "",
    instructorNoteEs: "",
    instructorNoteEn: "",
    methodologyEs: "",
    methodologyEn: "",
    howToChooseEs: "",
    howToChooseEn: "",
    sections: [],
    winnerIndex: 0,
    products: Array.from({ length: productSlotCount(type) }, (_, index) => emptyProduct(index)),
    comparison: [],
    faq: [],
    internalLinks: [],
    alternatives: [],
    seoTitleEs: "",
    seoTitleEn: "",
    seoDescriptionEs: "",
    seoDescriptionEn: "",
    relatedSlugs: [],
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    createdBy,
  };
  const { id: _id, ...data } = post;
  await ref.set(data);
  return post;
}

function omitUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(omitUndefined) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue;
      out[key] = omitUndefined(item);
    }
    return out as T;
  }
  return value;
}

export async function saveAffiliatePost(
  post: AffiliateBlogPost,
): Promise<AffiliateBlogPost> {
  const db = getAdminDb();
  if (!db) throw new Error("unavailable");
  const next = { ...post, updatedAt: new Date().toISOString() };
  const { id, ...data } = next;
  await db.collection(AFFILIATE_BLOG_COLLECTION).doc(id).set(omitUndefined(data), { merge: true });
  return next;
}

export async function deleteAffiliatePost(id: string): Promise<void> {
  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db) throw new Error("unavailable");
  const post = await getAffiliatePost(id);
  await db.collection(AFFILIATE_BLOG_COLLECTION).doc(id).delete();
  if (bucket && post) {
    const prefix = `${AFFILIATE_BLOG_STORAGE_PREFIX}/${id}/`;
    try {
      await bucket.deleteFiles({ prefix });
    } catch (error) {
      console.warn("[affiliate-blog] delete files failed:", error);
    }
  }
  if (post?.slug) revalidateAffiliateBlog(post.slug);
}

export async function ensureUniqueAffiliateSlug(
  desired: string,
  currentId: string,
): Promise<string> {
  const base = slugifyAffiliateTitle(desired);
  const existing = await listAffiliatePosts();
  const taken = new Set([
    ...blogSlugs,
    ...existing.filter((post) => post.id !== currentId && post.slug).map((post) => post.slug),
  ]);
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function extensionForImage(contentType: string, fileName: string): string {
  const type = contentType.toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName === "png" || fromName === "webp" || fromName === "jpg" || fromName === "jpeg") {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

export function normalizeImageContentType(contentType: string, fileName: string): string {
  const type = contentType.toLowerCase();
  if (type === "image/png") return "image/png";
  if (type === "image/webp") return "image/webp";
  if (type === "image/jpeg" || type === "image/jpg") return "image/jpeg";
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export async function prepareAffiliateImageUpload(params: {
  postId: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl: string; storagePath: string; contentType: string }> {
  if (params.size > AFFILIATE_BLOG_MAX_IMAGE_BYTES) throw new Error("file_too_large");
  const bucket = getAdminBucket();
  if (!bucket) throw new Error("unavailable");
  const contentType = normalizeImageContentType(params.contentType, params.fileName);
  const ext = extensionForImage(contentType, params.fileName);
  const storagePath = `${AFFILIATE_BLOG_STORAGE_PREFIX}/${params.postId}/${randomUUID()}.${ext}`;
  await ensureDirectUploadCors(bucket);
  const [uploadUrl] = await bucket.file(storagePath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });
  return { uploadUrl, storagePath, contentType };
}

export async function completeAffiliateImageUpload(params: {
  postId: string;
  productIndex: number;
  storagePath: string;
  contentType: string;
}): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(params.postId);
  const bucket = getAdminBucket();
  if (!post || !bucket) throw new Error("unavailable");
  if (!params.storagePath.startsWith(`${AFFILIATE_BLOG_STORAGE_PREFIX}/${params.postId}/`)) {
    throw new Error("forbidden");
  }
  const file = bucket.file(params.storagePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error("upload_incomplete");
  const token = randomUUID();
  await file.setMetadata({
    contentType: params.contentType,
    cacheControl: "public, max-age=31536000, immutable",
    metadata: { firebaseStorageDownloadTokens: token },
  });
  try {
    await file.makePublic();
  } catch {
    /* public URL still works with token */
  }
  const src = publicStorageUrl(bucket.name, params.storagePath, token);
  const maxImages = productImageLimits(post.type).max;
  const products = post.products.map((product, index) => {
    if (index !== params.productIndex) return product;
    return appendProductImage(
      product,
      emptyProductImage(src, "upload", params.storagePath),
      maxImages,
    );
  });
  const coverImage =
    post.coverImage ||
    (post.type === "review" || params.productIndex === 0 ? src : "") ||
    primaryProductImage(products[0] ?? emptyProduct(0));
  return saveAffiliatePost({ ...post, products, coverImage });
}

export async function removeAffiliateProductImage(params: {
  postId: string;
  productIndex: number;
  imageIndex: number;
}): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(params.postId);
  if (!post) throw new Error("unavailable");
  const products = post.products.map((product, index) => {
    if (index !== params.productIndex) return product;
    const gallery = productGallery(product).filter((_, i) => i !== params.imageIndex);
    return withPrimaryImage({ ...product, images: gallery, imageSrc: "", imageStoragePath: "" });
  });
  const coverImage = post.coverImage && products.some((item) => productGallery(item).some((image) => image.src === post.coverImage))
    ? post.coverImage
    : primaryProductImage(products[0] ?? emptyProduct(0));
  return saveAffiliatePost({ ...post, products, coverImage });
}

export async function saveAffiliateImageFromUrl(params: {
  postId: string;
  productIndex: number;
  imageUrl: string;
}): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(params.postId);
  if (!post) throw new Error("unavailable");
  const products = post.products.map((product, index) => {
    if (index !== params.productIndex) return product;
    return withPrimaryImage({
      ...product,
      images: mergeProductImages(productGallery(product), [
        emptyProductImage(params.imageUrl, "amazon"),
      ]),
    });
  });
  const coverImage =
    post.coverImage ||
    (post.type === "review" || params.productIndex === 0 ? params.imageUrl : "") ||
    params.imageUrl;
  return saveAffiliatePost({ ...post, products, coverImage });
}

export async function publishAffiliatePost(id: string): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(id);
  if (!post) throw new Error("not_found");
  if (!post.slug || !post.titleEs) throw new Error("not_ready");
  const next = await saveAffiliatePost({
    ...post,
    status: "published",
    publishedAt: post.publishedAt || new Date().toISOString(),
  });
  revalidateAffiliateBlog(next.slug);
  return next;
}

export async function unpublishAffiliatePost(id: string): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(id);
  if (!post) throw new Error("not_found");
  const next = await saveAffiliatePost({
    ...post,
    status: "draft",
  });
  revalidateAffiliateBlog(post.slug);
  return next;
}

export function applyAmazonMetaToProduct(
  product: AffiliateProduct,
  meta: AmazonProductMeta,
  affiliateUrl: string,
  type: AffiliatePostType = "review",
): AffiliateProduct {
  const maxImages = productImageLimits(type).max;
  const existing = productGallery(product);
  const uploads = existing.filter((image) => image.source === "upload");
  const amazonImages =
    meta.images.length > 0
      ? meta.images.slice(0, maxImages).map((src) => emptyProductImage(src, "amazon"))
      : existing.filter((image) => image.source === "amazon");
  const specs =
    product.specs.length > 0
      ? product.specs
      : meta.specs.map((spec) => ({
          labelEs: spec.label,
          labelEn: spec.label,
          valueEs: spec.value,
          valueEn: spec.value,
        }));
  return withPrimaryImage(
    {
      ...product,
      affiliateUrl,
      asin: meta.asin || product.asin,
      brand: product.brand || meta.brand,
      nameEs: product.nameEs || meta.title,
      nameEn: product.nameEn || meta.title,
      priceText: product.priceText || meta.priceText,
      rating: product.rating || meta.rating,
      reviewCount: product.reviewCount || meta.reviewCount,
      amazonBullets: product.amazonBullets.length ? product.amazonBullets : meta.bullets,
      amazonDescription: product.amazonDescription || meta.description,
      specs,
      images: mergeProductImages(uploads, amazonImages, maxImages),
    },
    maxImages,
  );
}

export function isAffiliatePostReadyToGenerate(post: AffiliateBlogPost): boolean {
  return post.products.every(
    (product) => product.affiliateUrl && productMeetsImageRequirement(product, post.type),
  );
}
