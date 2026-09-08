import { setRequestLocale } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { BlogCardGrid } from "@/components/blog/BlogCardGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { listPublicBlogSections, paginateBlogCards, parseBlogListPages } from "@/lib/blog-catalog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { localizedPath } from "@/lib/seo-urls";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ guias?: string | string[]; productos?: string | string[] }>;
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

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const { guidesPage, productsPage } = parseBlogListPages(query);
  if (guidesPage > 1) {
    permanentRedirect(
      localizedPath(locale, {
        pathname: "/blog/guias/[page]",
        params: { page: String(guidesPage) },
      }),
    );
  }
  if (productsPage > 1) {
    permanentRedirect(
      localizedPath(locale, {
        pathname: "/blog/productos/[page]",
        params: { page: String(productsPage) },
      }),
    );
  }

  const { guides, products } = await listPublicBlogSections(locale);
  const guidesPageData = paginateBlogCards(guides, 1);
  const productsPageData = paginateBlogCards(products, 1);

  return (
    <>
      <BreadcrumbJsonLd locale={locale} items={[{ name: "Blog", path: "/blog" }]} />
      <section className="page-header">
        <div className="container-page">
          <p className="eyebrow">Blog</p>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, "Nieve y material", "Snow and gear")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            {pickLocale(
              locale,
              "Guías para tus días en Sierra Nevada y productos que merecen la pena: rankings y reviews de material.",
              "Guides for your days in Sierra Nevada, plus gear worth buying: rankings and reviews.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/blog/guias" className="btn-secondary !w-auto !px-4 !py-2 text-sm">
              {pickLocale(locale, "Guías para la nieve", "Snow guides")}
            </Link>
            <Link href="/blog/productos" className="btn-secondary !w-auto !px-4 !py-2 text-sm">
              {pickLocale(locale, "Productos", "Products")}
            </Link>
          </div>
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

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow={pickLocale(locale, "Material", "Gear")}
            title={pickLocale(locale, "Productos", "Products")}
            description={pickLocale(
              locale,
              "Rankings y reviews de material de esquí y snowboard, pensados para Sierra Nevada. Como afiliados de Amazon, podemos recibir comisión por compras que cumplan los requisitos.",
              "Ski and snowboard rankings and reviews, written for Sierra Nevada. As an Amazon Associate, we may earn from qualifying purchases.",
            )}
          />
          {products.length === 0 ? (
            <div className="card mx-auto mt-8 max-w-xl text-center">
              <p className="text-sm text-muted">
                {pickLocale(
                  locale,
                  "Pronto publicaremos rankings y reviews de material de esquí y snowboard.",
                  "Ski and snowboard rankings and reviews will appear here soon.",
                )}
              </p>
              <Link href="/clases" className="btn-primary mt-6 inline-flex !w-auto">
                {pickLocale(locale, "Ver clases", "View lessons")}
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <BlogCardGrid posts={productsPageData.items} locale={locale} />
              {productsPageData.totalPages > 1 ? (
                <p className="mt-8 text-center">
                  <Link href="/blog/productos" className="font-semibold text-hielo hover:text-accent">
                    {pickLocale(locale, "Ver todos los productos →", "See all products →")}
                  </Link>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
