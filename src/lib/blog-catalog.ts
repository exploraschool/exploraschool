import { blogPosts, getBlogPost, type BlogPost } from "@/data/blog";
import {
  getPublishedAffiliatePostBySlug,
  listPublishedAffiliatePosts,
  type AffiliateBlogPost,
} from "@/lib/affiliate-blog";
import { compareByPopularity, getBlogViewCounts } from "@/lib/blog-popularity";

export const BLOG_PAGE_SIZE = 6;

export type PublicBlogCard = {
  kind: "guide" | "affiliate";
  affiliateType?: "ranking" | "review";
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  date: string;
  coverImage: string;
  coverAltEs: string;
  coverAltEn: string;
};

function editorialCard(post: BlogPost): PublicBlogCard {
  return {
    kind: "guide",
    slug: post.slug,
    titleEs: post.titleEs,
    titleEn: post.titleEn,
    excerptEs: post.excerptEs,
    excerptEn: post.excerptEn,
    date: post.date,
    coverImage: post.coverImage,
    coverAltEs: post.coverAltEs,
    coverAltEn: post.coverAltEn,
  };
}

function affiliateCard(post: AffiliateBlogPost): PublicBlogCard {
  return {
    kind: "affiliate",
    affiliateType: post.type,
    slug: post.slug,
    titleEs: post.titleEs,
    titleEn: post.titleEn,
    excerptEs: post.excerptEs,
    excerptEn: post.excerptEn,
    date: (post.publishedAt || post.updatedAt).slice(0, 10),
    coverImage: post.coverImage,
    coverAltEs: post.coverAltEs,
    coverAltEn: post.coverAltEn,
  };
}

export async function listPublicBlogCards(): Promise<PublicBlogCard[]> {
  const { guides, products } = await listPublicBlogSections();
  const views = await getBlogViewCounts();
  return [...guides, ...products].sort(compareByPopularity(views));
}

export async function listPublicBlogSections(): Promise<{
  guides: PublicBlogCard[];
  products: PublicBlogCard[];
}> {
  const [affiliate, views] = await Promise.all([
    listPublishedAffiliatePosts(),
    getBlogViewCounts(),
  ]);
  const byPopularity = compareByPopularity(views);
  return {
    guides: blogPosts.map(editorialCard).sort(byPopularity),
    products: affiliate.map(affiliateCard).sort(byPopularity),
  };
}

export function paginateBlogCards(
  cards: PublicBlogCard[],
  page: number,
): {
  items: PublicBlogCard[];
  page: number;
  totalPages: number;
  totalItems: number;
} {
  const totalItems = cards.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / BLOG_PAGE_SIZE) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * BLOG_PAGE_SIZE;
  return {
    items: cards.slice(start, start + BLOG_PAGE_SIZE),
    page: safePage,
    totalPages: totalItems === 0 ? 0 : totalPages,
    totalItems,
  };
}

function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseBlogListPages(searchParams: {
  guias?: string | string[];
  productos?: string | string[];
}): { guidesPage: number; productsPage: number } {
  return {
    guidesPage: parsePage(searchParams.guias),
    productsPage: parsePage(searchParams.productos),
  };
}

export async function resolvePublicBlogPost(slug: string): Promise<
  | { kind: "guide"; post: BlogPost }
  | { kind: "affiliate"; post: AffiliateBlogPost }
  | null
> {
  const editorial = getBlogPost(slug);
  if (editorial) return { kind: "guide", post: editorial };
  const affiliate = await getPublishedAffiliatePostBySlug(slug);
  if (affiliate) return { kind: "affiliate", post: affiliate };
  return null;
}
