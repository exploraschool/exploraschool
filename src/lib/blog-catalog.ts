import { blogPosts, getBlogPost, type BlogPost } from "@/data/blog";
import { editorialSeo, isListedEditorial, publicEditorialSlug } from "@/data/blog-urls";
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

function editorialCard(post: BlogPost, locale: string): PublicBlogCard {
  return {
    kind: "guide",
    slug: publicEditorialSlug(post.slug, locale),
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

function affiliateCard(post: AffiliateBlogPost, locale: string): PublicBlogCard {
  const slug = locale === "en" ? post.slugEn || post.slug : post.slug;
  return {
    kind: "affiliate",
    affiliateType: post.type,
    slug,
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

export async function listPublicBlogCards(locale = "es"): Promise<PublicBlogCard[]> {
  const { guides, products } = await listPublicBlogSections(locale);
  const views = await getBlogViewCounts();
  return [...guides, ...products].sort(compareByPopularity(views));
}

export async function listPublicBlogSections(locale = "es"): Promise<{
  guides: PublicBlogCard[];
  products: PublicBlogCard[];
}> {
  const [affiliate, views] = await Promise.all([
    listPublishedAffiliatePosts(),
    getBlogViewCounts(),
  ]);
  const byPopularity = compareByPopularity(views);
  return {
    guides: blogPosts
      .filter((post) => isListedEditorial(post.slug))
      .map((post) => editorialCard(post, locale))
      .sort(byPopularity),
    products: affiliate.map((post) => affiliateCard(post, locale)).sort(byPopularity),
  };
}

/** Page numbers above 1, so `/blog/guias/2` can be cached instead of rendered on every visit. */
export async function blogSectionPageParams(
  section: "guides" | "products",
): Promise<{ page: string }[]> {
  const sections = await listPublicBlogSections("es");
  const cards = section === "guides" ? sections.guides : sections.products;
  const pageCount = Math.ceil(cards.length / BLOG_PAGE_SIZE);
  const params: { page: string }[] = [];
  for (let page = 2; page <= pageCount; page += 1) {
    params.push({ page: String(page) });
  }
  return params;
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

export async function resolvePublicBlogPost(slug: string): Promise<
  | { kind: "guide"; post: BlogPost }
  | { kind: "affiliate"; post: AffiliateBlogPost }
  | { kind: "redirect"; href: import("@/i18n/pathnames").AppPathname }
  | null
> {
  const editorial = getBlogPost(slug);
  if (editorial) {
    const seo = editorialSeo(editorial.slug);
    if (seo.redirectTo) return { kind: "redirect", href: seo.redirectTo };
    return { kind: "guide", post: editorial };
  }
  const affiliate = await getPublishedAffiliatePostBySlug(slug);
  if (affiliate) return { kind: "affiliate", post: affiliate };
  return null;
}
