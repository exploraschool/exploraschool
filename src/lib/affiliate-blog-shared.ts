export const AFFILIATE_BLOG_COLLECTION = "affiliateBlogPosts";
export const AFFILIATE_BLOG_STORAGE_PREFIX = "public/affiliate-blog";
export const AFFILIATE_BLOG_MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const AFFILIATE_RANKING_SIZE = 6;
export const AFFILIATE_MAX_PRODUCT_IMAGES = 8;

export type AffiliatePostType = "ranking" | "review";
export type AffiliatePostStatus = "draft" | "published";
export type AffiliateImageSource = "upload" | "amazon";

export type AffiliateProductImage = {
  src: string;
  storagePath: string;
  source: AffiliateImageSource;
  altEs: string;
  altEn: string;
  captionEs: string;
  captionEn: string;
};

export type AffiliateSpec = {
  labelEs: string;
  labelEn: string;
  valueEs: string;
  valueEn: string;
};

export type AffiliateSection = {
  headingEs: string;
  headingEn: string;
  bodyEs: string;
  bodyEn: string;
};

export type AffiliateProduct = {
  index: number;
  affiliateUrl: string;
  asin: string;
  brand: string;
  imageSrc: string;
  imageStoragePath: string;
  imageSource: AffiliateImageSource;
  images: AffiliateProductImage[];
  altEs: string;
  altEn: string;
  captionEs: string;
  captionEn: string;
  nameEs: string;
  nameEn: string;
  priceText: string;
  rating: string;
  reviewCount: string;
  amazonBullets: string[];
  amazonDescription: string;
  summaryEs: string;
  summaryEn: string;
  bodyEs: string;
  bodyEn: string;
  onSnowEs: string;
  onSnowEn: string;
  forWhomEs: string;
  forWhomEn: string;
  skipIfEs: string;
  skipIfEn: string;
  specs: AffiliateSpec[];
  prosEs: string[];
  consEs: string[];
  prosEn: string[];
  consEn: string[];
  ctaLabelEs: string;
  ctaLabelEn: string;
};

export type AffiliateFaq = {
  qEs: string;
  qEn: string;
  aEs: string;
  aEn: string;
};

export type AffiliateInternalLink = {
  href: string;
  labelEs: string;
  labelEn: string;
};

export type AffiliateComparisonRow = {
  labelEs: string;
  labelEn: string;
  values: string[];
};

export type AffiliateBlogPost = {
  id: string;
  type: AffiliatePostType;
  status: AffiliatePostStatus;
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  coverImage: string;
  coverAltEs: string;
  coverAltEn: string;
  introEs: string;
  introEn: string;
  verdictEs: string;
  verdictEn: string;
  methodologyEs: string;
  methodologyEn: string;
  howToChooseEs: string;
  howToChooseEn: string;
  sections: AffiliateSection[];
  winnerIndex: number;
  products: AffiliateProduct[];
  comparison: AffiliateComparisonRow[];
  faq: AffiliateFaq[];
  internalLinks: AffiliateInternalLink[];
  seoTitleEs: string;
  seoTitleEn: string;
  seoDescriptionEs: string;
  seoDescriptionEn: string;
  relatedSlugs: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdBy: string;
};

export function emptyProductImage(
  src: string,
  source: AffiliateImageSource = "amazon",
  storagePath = "",
): AffiliateProductImage {
  return {
    src,
    storagePath,
    source,
    altEs: "",
    altEn: "",
    captionEs: "",
    captionEn: "",
  };
}

export function emptyProduct(index: number): AffiliateProduct {
  return {
    index,
    affiliateUrl: "",
    asin: "",
    brand: "",
    imageSrc: "",
    imageStoragePath: "",
    imageSource: "upload",
    images: [],
    altEs: "",
    altEn: "",
    captionEs: "",
    captionEn: "",
    nameEs: "",
    nameEn: "",
    priceText: "",
    rating: "",
    reviewCount: "",
    amazonBullets: [],
    amazonDescription: "",
    summaryEs: "",
    summaryEn: "",
    bodyEs: "",
    bodyEn: "",
    onSnowEs: "",
    onSnowEn: "",
    forWhomEs: "",
    forWhomEn: "",
    skipIfEs: "",
    skipIfEn: "",
    specs: [],
    prosEs: [],
    consEs: [],
    prosEn: [],
    consEn: [],
    ctaLabelEs: "Ver en Amazon",
    ctaLabelEn: "See on Amazon",
  };
}

export function productGallery(product: AffiliateProduct): AffiliateProductImage[] {
  if (product.images?.length) return product.images.filter((image) => image.src);
  if (product.imageSrc) {
    return [emptyProductImage(product.imageSrc, product.imageSource, product.imageStoragePath)];
  }
  return [];
}

export function primaryProductImage(product: AffiliateProduct): string {
  return productGallery(product)[0]?.src || product.imageSrc || "";
}

export function productSlotCount(type: AffiliatePostType): number {
  return type === "ranking" ? AFFILIATE_RANKING_SIZE : 1;
}

export function slugifyAffiliateTitle(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || `guia-compra-${Date.now().toString(36)}`;
}

function imageKey(src: string): string {
  return src.replace(/\._AC_[^.]+\./, ".").split("?")[0];
}

export function mergeProductImages(
  existing: AffiliateProductImage[],
  incoming: AffiliateProductImage[],
): AffiliateProductImage[] {
  const seen = new Set<string>();
  const out: AffiliateProductImage[] = [];
  for (const image of [...existing, ...incoming]) {
    if (!image.src) continue;
    const key = imageKey(image.src);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(image);
    if (out.length >= AFFILIATE_MAX_PRODUCT_IMAGES) break;
  }
  return out;
}

export function appendProductImage(
  product: AffiliateProduct,
  image: AffiliateProductImage,
): AffiliateProduct {
  const gallery = productGallery(product);
  const next =
    gallery.length >= AFFILIATE_MAX_PRODUCT_IMAGES
      ? [...gallery.slice(0, AFFILIATE_MAX_PRODUCT_IMAGES - 1), image]
      : mergeProductImages(gallery, [image]);
  return withPrimaryImage({ ...product, images: next });
}

export function withPrimaryImage(product: AffiliateProduct): AffiliateProduct {
  const gallery = mergeProductImages(productGallery(product), []).slice(
    0,
    AFFILIATE_MAX_PRODUCT_IMAGES,
  );
  const first = gallery[0];
  return {
    ...product,
    images: gallery,
    imageSrc: first?.src || "",
    imageStoragePath: first?.storagePath || "",
    imageSource: first?.source || product.imageSource,
    altEs: product.altEs || first?.altEs || "",
    altEn: product.altEn || first?.altEn || "",
    captionEs: product.captionEs || first?.captionEs || "",
    captionEn: product.captionEn || first?.captionEn || "",
  };
}
