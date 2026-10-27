import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { BlogCardGrid } from "@/components/blog/BlogCardGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { listPublicBlogSections, paginateBlogCards } from "@/lib/blog-catalog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

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
      "Guías para esquiar y hacer snowboard en Sierra Nevada: clases, forfait, familias, material y tu primer día en la estación.",
      "Guides for skiing and snowboarding in Sierra Nevada: lessons, lift passes, families, gear and your first day at the resort.",
    ),
    ogImage: "/images/blog/blog-primera-vez.jpg",
    ogImageAlt: pickLocale(
      locale,
      "Principiante en su primera vez esquiando en Sierra Nevada",
      "Beginner on a first ski day in Sierra Nevada",
    ),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { guides } = await listPublicBlogSections(locale);
  const guidesPageData = paginateBlogCards(guides, 1);

  return (
    <>
      <BreadcrumbJsonLd locale={locale} items={[{ name: "Blog", path: "/blog" }]} />
      <section className="page-header">
        <div className="container-page">
          <p className="eyebrow">Blog</p>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, "Guías para la nieve", "Guides for the snow")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            {pickLocale(
              locale,
              "Consejos para clases, forfait, familias y tu primer día en Sierra Nevada.",
              "Advice for lessons, lift passes, families and your first day in Sierra Nevada.",
            )}
          </p>
          {guidesPageData.totalPages > 1 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/blog/guias" className="btn-secondary !w-auto !px-4 !py-2 text-sm">
                {pickLocale(locale, "Ver todas las guías", "See all guides")}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow={pickLocale(locale, "Estación", "Resort")}
            title={pickLocale(locale, "Guías para la nieve", "Guides for the snow")}
            description={pickLocale(
              locale,
              "Consejos para clases, forfait, familias y tu primer día en Sierra Nevada.",
              "Advice for lessons, lift passes, families and your first day in Sierra Nevada.",
            )}
          />
          <div className="mt-8">
            <BlogCardGrid posts={guidesPageData.items} locale={locale} />
            {guidesPageData.totalPages > 1 ? (
              <p className="mt-8 text-center">
                <Link href="/blog/guias" className="font-semibold text-hielo hover:text-accent">
                  {pickLocale(locale, "Ver todas las guías →", "See all guides →")}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
