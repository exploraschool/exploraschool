import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BlogMarkdown } from "@/components/BlogMarkdown";
import { Link } from "@/i18n/routing";
import { blogPosts, getBlogPost } from "@/data/blog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return buildPageMetadata({
      locale,
      path: "/blog",
      title: "Blog de esquí y snowboard en Sierra Nevada",
      description:
        "Guías prácticas de esquí, snowboard y clases en Sierra Nevada con Explora School & Club.",
    });
  }
  return buildPageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: pickLocale(locale, post.titleEs, post.titleEn),
    description: pickLocale(locale, post.excerptEs, post.excerptEn),
    ogImage: post.coverImage,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug);
  if (!post) notFound();

  const content = pickLocale(locale, post.contentEs, post.contentEn);
  const related = post.relatedSlugs
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const siteUrl = getSiteUrl();
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: pickLocale(locale, post.titleEs, post.titleEn),
    description: pickLocale(locale, post.excerptEs, post.excerptEn),
    image: `${siteUrl}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Explora School & Club",
    },
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${post.slug}`,
    inLanguage: locale === "en" ? "en-GB" : "es-ES",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <section className="page-header">
        <div className="container-page">
          <BackLink href="/blog">
            {pickLocale(locale, "Volver al blog", "Back to blog")}
          </BackLink>
          <time className="mt-4 block text-xs font-medium uppercase tracking-wider text-oro">
            {new Date(post.date).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
          </time>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, post.titleEs, post.titleEn)}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            {pickLocale(locale, post.excerptEs, post.excerptEn)}
          </p>
        </div>
      </section>

      <div className="container-page content-narrow -mt-2 sm:-mt-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={pickLocale(locale, post.coverAltEs, post.coverAltEn)}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      </div>

      <article className="section-padding pt-8 sm:pt-10">
        <div className="container-page content-narrow">
          <BlogMarkdown content={content} />

          <div className="mt-10 flex flex-wrap gap-3 border-t border-hielo/10 pt-8">
            <Link href="/clases" className="btn-primary !w-auto">
              {pickLocale(locale, "Ver clases", "View lessons")}
            </Link>
            <Link href="/reserva" className="btn-secondary !w-auto">
              {pickLocale(locale, "Reservar", "Book now")}
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section-padding pt-0">
          <div className="container-page content-narrow">
            <h2 className="font-display text-2xl font-semibold">
              {pickLocale(locale, "También te puede interesar", "You may also like")}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group block overflow-hidden rounded-xl border border-hielo/8 transition-colors hover:border-hielo/30"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={r.coverImage}
                      alt={pickLocale(locale, r.coverAltEs, r.coverAltEn)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 240px"
                    />
                  </div>
                  <p className="p-3 text-sm font-semibold leading-snug group-hover:text-accent">
                    {pickLocale(locale, r.titleEs, r.titleEn)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
