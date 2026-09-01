import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { blogPosts } from "@/data/blog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/blog",
    title: pickLocale(locale, "Blog", "Blog"),
    description: pickLocale(
      locale,
      "Consejos, novedades y experiencias de Explora School & Club en Sierra Nevada.",
      "Tips, news and stories from Explora School & Club in Sierra Nevada.",
    ),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="page-header">
        <div className="container-page">
          <p className="eyebrow">Blog</p>
          <h1 className="page-title mt-2 sm:mt-2.5">Blog</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          {blogPosts.length === 0 ? (
            <div className="card mx-auto max-w-xl text-center">
              <p className="text-sm text-muted">
                {pickLocale(
                  locale,
                  "Próximamente publicaremos consejos y novedades sobre esquí y snowboard en Sierra Nevada.",
                  "We will soon publish tips and news about skiing and snowboarding in Sierra Nevada.",
                )}
              </p>
              <Link href="/clases" className="btn-primary mt-6 inline-flex !w-auto">
                {pickLocale(locale, "Ver clases", "View lessons")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-gap md:grid-cols-2">
              {blogPosts.map((post) => (
                <article key={post.slug} className="card hover:border-hielo/25">
                  <time className="text-xs font-medium uppercase tracking-wider text-oro">
                    {new Date(post.date).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                  </time>
                  <h2 className="mt-3 font-display text-xl font-semibold">
                    <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                      {pickLocale(locale, post.titleEs, post.titleEn)}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-muted">
                    {pickLocale(locale, post.excerptEs, post.excerptEn)}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-hielo hover:text-accent"
                  >
                    {pickLocale(locale, "Leer más →", "Read more →")}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
