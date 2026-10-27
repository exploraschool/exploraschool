import { blogPosts, getBlogPost, type BlogPost } from "@/data/blog";
import { editorialSeo, isListedEditorial, publicEditorialSlug } from "@/data/blog-urls";
import { compareByPopularity, getBlogViewCounts } from "@/lib/blog-popularity";

export const BLOG_PAGE_SIZE = 6;

export type PublicBlogCard = {
  kind: "guide";
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

export async function listPublicBlogCards(locale = "es"): Promise<PublicBlogCard[]> {
  const { guides } = await listPublicBlogSections(locale);
  return guides;
}

export async function listPublicBlogSections(locale = "es"): Promise<{
  guides: PublicBlogCard[];
}> {
  const views = await getBlogViewCounts();
  const byPopularity = compareByPopularity(views);
  return {
    guides: blogPosts
      .filter((post) => isListedEditorial(post.slug))
      .map((post) => editorialCard(post, locale))
      .sort(byPopularity),
  };
}

/** Page numbers above 1, so `/blog/guias/2` can be cached instead of rendered on every visit. */
export async function blogSectionPageParams(): Promise<{ page: string }[]> {
  const { guides } = await listPublicBlogSections("es");
  const pageCount = Math.ceil(guides.length / BLOG_PAGE_SIZE);
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
  | { kind: "redirect"; href: import("@/i18n/pathnames").AppPathname }
  | null
> {
  const editorial = getBlogPost(slug);
  if (editorial) {
    const seo = editorialSeo(editorial.slug);
    if (seo.redirectTo) return { kind: "redirect", href: seo.redirectTo };
    return { kind: "guide", post: editorial };
  }
  return null;
}
