import Image from "next/image";
import { Link } from "@/i18n/routing";
import { blogHref } from "@/i18n/href";
import { pickLocale } from "@/lib/locale";
import type { PublicBlogCard } from "@/lib/blog-catalog";

function productBadge(post: PublicBlogCard, locale: string): string | null {
  if (post.kind !== "affiliate") return null;
  if (post.affiliateType === "review") return pickLocale(locale, "Review", "Review");
  return pickLocale(locale, "Ranking", "Ranking");
}

export function BlogCardGrid({
  posts,
  locale,
}: {
  posts: PublicBlogCard[];
  locale: string;
}) {
  return (
    <div className="grid grid-gap md:grid-cols-2">
      {posts.map((post) => {
        const badge = productBadge(post, locale);
        return (
          <article key={post.slug} className="card overflow-hidden p-0 hover:border-hielo/25">
            <Link href={blogHref(post.slug)} className="relative block aspect-[16/9]">
              <Image
                src={post.coverImage}
                alt={pickLocale(locale, post.coverAltEs, post.coverAltEn)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-xs font-medium uppercase tracking-wider text-oro">
                  {new Date(post.date).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                </time>
                {badge ? (
                  <span className="rounded-full bg-hielo/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-hielo">
                    {badge}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold">
                <Link href={blogHref(post.slug)} className="hover:text-accent">
                  {pickLocale(locale, post.titleEs, post.titleEn)}
                </Link>
              </h3>
              <p className="mt-3 text-sm text-muted">
                {pickLocale(locale, post.excerptEs, post.excerptEn)}
              </p>
              <Link
                href={blogHref(post.slug)}
                className="mt-4 inline-block text-sm font-semibold text-hielo hover:text-accent"
              >
                {pickLocale(locale, "Leer más →", "Read more →")}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
