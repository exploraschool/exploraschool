import { blogHref, toHref, type AppHref } from "@/i18n/href";
import { getBlogPost } from "@/data/blog";
import { editorialSeo, publicEditorialSlug } from "@/data/blog-urls";

const BLOG_SECTIONS = new Set(["guias", "productos", "guides", "gear"]);

function splitSuffix(href: string): { path: string; suffix: string } {
  const hash = href.indexOf("#");
  const query = href.indexOf("?");
  const cut = [hash, query].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (cut == null) return { path: href, suffix: "" };
  return { path: href.slice(0, cut), suffix: href.slice(cut) };
}

/** Resolve markdown/FAQ hrefs to the public internal pathname for this locale. */
export function localizeContentHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { path, suffix } = splitSuffix(href);
  const blog = path.match(/^\/blog\/([^/]+)$/);
  if (!blog || BLOG_SECTIONS.has(blog[1])) return href;

  const post = getBlogPost(blog[1]);
  if (!post) return href;
  const seo = editorialSeo(post.slug);
  if (seo.redirectTo) return `${seo.redirectTo}${suffix}`;
  return `/blog/${publicEditorialSlug(post.slug, locale)}${suffix}`;
}

export function contentLinkHref(href: string, locale: string): AppHref {
  const localized = localizeContentHref(href, locale);
  const { path } = splitSuffix(localized);
  const blog = path.match(/^\/blog\/([^/]+)$/);
  if (blog && !BLOG_SECTIONS.has(blog[1])) {
    return blogHref(blog[1]);
  }
  return toHref(localized);
}
