export const AFFILIATE_BLOG_COLLECTION = "affiliateBlogPosts";
export const AFFILIATE_BLOG_STORAGE_PREFIX = "public/affiliate-blog";
export const AFFILIATE_BLOG_MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const AFFILIATE_RANKING_SIZE = 6;

export type AffiliatePostType = "ranking" | "review";
export type AffiliatePostStatus = "draft" | "published";
export type AffiliateImageSource = "upload" | "amazon";

export type AffiliateProduct = {
  index: number;
  affiliateUrl: string;
  asin: string;
  imageSrc: string;
  imageStoragePath: string;
  imageSource: AffiliateImageSource;
  altEs: string;
  altEn: string;
  captionEs: string;
  captionEn: string;
  nameEs: string;
  nameEn: string;
  priceText: string;
  summaryEs: string;
  summaryEn: string;
  forWhomEs: string;
  forWhomEn: string;
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
  methodologyEs: string;
  methodologyEn: string;
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

export function emptyProduct(index: number): AffiliateProduct {
  return {
    index,
    affiliateUrl: "",
    asin: "",
    imageSrc: "",
    imageStoragePath: "",
    imageSource: "upload",
    altEs: "",
    altEn: "",
    captionEs: "",
    captionEn: "",
    nameEs: "",
    nameEn: "",
    priceText: "",
    summaryEs: "",
    summaryEn: "",
    forWhomEs: "",
    forWhomEn: "",
    prosEs: [],
    consEs: [],
    prosEn: [],
    consEn: [],
    ctaLabelEs: "Ver en Amazon",
    ctaLabelEn: "See on Amazon",
  };
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
