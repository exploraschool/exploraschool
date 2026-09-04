import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { publicStorageUrl } from "@/lib/live-gallery-shared";
import { ensureDirectUploadCors } from "@/lib/storage-cors";
import { blogSlugs } from "@/data/blog";
import {
  AFFILIATE_BLOG_COLLECTION,
  AFFILIATE_BLOG_MAX_IMAGE_BYTES,
  AFFILIATE_BLOG_STORAGE_PREFIX,
  emptyProduct,
  productSlotCount,
  slugifyAffiliateTitle,
  type AffiliateBlogPost,
  type AffiliatePostType,
  type AffiliateProduct,
} from "@/lib/affiliate-blog-shared";

export {
  AFFILIATE_BLOG_COLLECTION,
  AFFILIATE_BLOG_MAX_IMAGE_BYTES,
  AFFILIATE_BLOG_STORAGE_PREFIX,
  emptyProduct,
  productSlotCount,
  slugifyAffiliateTitle,
  type AffiliateBlogPost,
  type AffiliateFaq,
  type AffiliateInternalLink,
  type AffiliatePostStatus,
  type AffiliatePostType,
  type AffiliateProduct,
} from "@/lib/affiliate-blog-shared";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function parseAffiliatePost(id: string, data: Record<string, unknown>): AffiliateBlogPost {
  const type: AffiliatePostType = data.type === "review" ? "review" : "ranking";
  const slots = productSlotCount(type);
  const rawProducts = Array.isArray(data.products) ? data.products : [];
  const products = Array.from({ length: slots }, (_, index) => {
    const raw = rawProducts[index] as Record<string, unknown> | undefined;
    const base = emptyProduct(index);
    if (!raw) return base;
    return {
      ...base,
      index,
      affiliateUrl: asString(raw.affiliateUrl),
      asin: asString(raw.asin),
      imageSrc: asString(raw.imageSrc),
      imageStoragePath: asString(raw.imageStoragePath),
      imageSource: raw.imageSource === "amazon" ? "amazon" : "upload",
      altEs: asString(raw.altEs),
      altEn: asString(raw.altEn),
      captionEs: asString(raw.captionEs),
      captionEn: asString(raw.captionEn),
      nameEs: asString(raw.nameEs),
      nameEn: asString(raw.nameEn),
      priceText: asString(raw.priceText),
      summaryEs: asString(raw.summaryEs),
      summaryEn: asString(raw.summaryEn),
      forWhomEs: asString(raw.forWhomEs),
      forWhomEn: asString(raw.forWhomEn),
      prosEs: asStringArray(raw.prosEs),
      consEs: asStringArray(raw.consEs),
      prosEn: asStringArray(raw.prosEn),
      consEn: asStringArray(raw.consEn),
      ctaLabelEs: asString(raw.ctaLabelEs, base.ctaLabelEs),
      ctaLabelEn: asString(raw.ctaLabelEn, base.ctaLabelEn),
    } satisfies AffiliateProduct;
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
    methodologyEs: asString(data.methodologyEs),
    methodologyEn: asString(data.methodologyEn),
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
    .map((doc) => parseAffiliatePost(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
    methodologyEs: "",
    methodologyEn: "",
    winnerIndex: 0,
    products: Array.from({ length: productSlotCount(type) }, (_, index) => emptyProduct(index)),
    comparison: [],
    faq: [],
    internalLinks: [],
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

export async function saveAffiliatePost(
  post: AffiliateBlogPost,
): Promise<AffiliateBlogPost> {
  const db = getAdminDb();
  if (!db) throw new Error("unavailable");
  const next = { ...post, updatedAt: new Date().toISOString() };
  const { id, ...data } = next;
  await db.collection(AFFILIATE_BLOG_COLLECTION).doc(id).set(data, { merge: true });
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
  const products = post.products.map((product, index) =>
    index === params.productIndex
      ? {
          ...product,
          imageSrc: src,
          imageStoragePath: params.storagePath,
          imageSource: "upload" as const,
        }
      : product,
  );
  const coverImage = post.type === "review" || params.productIndex === 0 ? src : post.coverImage;
  return saveAffiliatePost({ ...post, products, coverImage: coverImage || src });
}

export async function saveAffiliateImageFromUrl(params: {
  postId: string;
  productIndex: number;
  imageUrl: string;
}): Promise<AffiliateBlogPost> {
  const post = await getAffiliatePost(params.postId);
  if (!post) throw new Error("unavailable");
  const products = post.products.map((product, index) =>
    index === params.productIndex
      ? {
          ...product,
          imageSrc: params.imageUrl,
          imageStoragePath: "",
          imageSource: "amazon" as const,
        }
      : product,
  );
  const coverImage =
    post.type === "review" || params.productIndex === 0 ? params.imageUrl : post.coverImage;
  return saveAffiliatePost({ ...post, products, coverImage: coverImage || params.imageUrl });
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

export function isAffiliatePostReadyToGenerate(post: AffiliateBlogPost): boolean {
  return post.products.every((product) => product.affiliateUrl && product.imageSrc);
}
