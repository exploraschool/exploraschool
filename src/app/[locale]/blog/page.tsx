import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { blogPosts } from "@/data/blog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/blog",
    title: pickLocale(
      locale,
      "Blog de esquí y snowboard en Sierra Nevada",
      "Ski and snowboard blog for Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Guías prácticas de esquí, snowboard y clases en Sierra Nevada: tips para principiantes, familias, forfait, seguridad y más.",
      "Practical ski and snowboard guides for Sierra Nevada: beginner tips, families, lift passes, safety and more.",
    ),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[{ name: "Blog", path: "/blog" }]}
      />
      <section className="page-header">
        <div className="container-page">
          <p className="eyebrow">Blog</p>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, "Guías para la nieve", "Guides for the snow")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            {pickLocale(
              locale,
              "Guías para aprovechar tus clases, el forfait y tu primer día en la estación.",
              "Guides to make the most of your lessons, lift pass and first day at the resort.",
            )}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          {posts.length === 0 ? (
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
              {posts.map((post) => (
                <article key={post.slug} className="card overflow-hidden p-0 hover:border-hielo/25">
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9]">
                    <Image
                      src={post.coverImage}
                      alt={pickLocale(locale, post.coverAltEs, post.coverAltEn)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Link>
                  <div className="p-5 sm:p-6">
                    <time className="text-xs font-medium uppercase tracking-wider text-oro">
                      {new Date(post.date).toLocaleDateString(
                        locale === "en" ? "en-GB" : "es-ES",
                      )}
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
