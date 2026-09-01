export type BlogPost = {
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  date: string;
  author: string;
  contentEs: string;
  contentEn: string;
  migrated: boolean;
};

export const blogPosts: BlogPost[] = [];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogSlugs = blogPosts.map((p) => p.slug);
