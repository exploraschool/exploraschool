import { blogPosts, getBlogPost, type BlogPost } from "@/data/blog";
import {
  getPublishedAffiliatePostBySlug,
  listPublishedAffiliatePosts,
  type AffiliateBlogPost,
} from "@/lib/affiliate-blog";

export type PublicBlogCard = {
  kind: "guide" | "affiliate";
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
  const affiliate = await listPublishedAffiliatePosts();
  return [...blogPosts.map(editorialCard), ...affiliate.map(affiliateCard)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
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
