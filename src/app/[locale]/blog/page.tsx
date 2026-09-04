import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { BlogPagination } from "@/components/BlogPagination";
import { SectionHeader } from "@/components/SectionHeader";
import {
  listPublicBlogSections,
  paginateBlogCards,
  parseBlogListPages,
  type PublicBlogCard,
} from "@/lib/blog-catalog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ guias?: string | string[]; productos?: string | string[] }>;
};

function blogHref(guidesPage: number, productsPage: number, hash: "#guias" | "#productos"): string {
  const params = new URLSearchParams();
  if (guidesPage > 1) params.set("guias", String(guidesPage));
  if (productsPage > 1) params.set("productos", String(productsPage));
  const query = params.toString();
  return `/blog${query ? `?${query}` : ""}${hash}`;
}

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
      "Guías para la nieve en Sierra Nevada y productos recomendados: rankings y reviews de material de esquí y snowboard.",
      "Snow guides for Sierra Nevada plus product rankings and reviews of ski and snowboard gear.",
    ),
    ogImage: "/images/blog/blog-primera-vez.jpg",
    ogImageAlt: pickLocale(
      locale,
      "Principiante en su primera vez esquiando en Sierra Nevada",
      "Beginner on a first ski day in Sierra Nevada",
    ),
  });
}

function productBadge(post: PublicBlogCard, locale: string): string | null {
  if (post.kind !== "affiliate") return null;
  if (post.affiliateType === "review") return pickLocale(locale, "Review", "Review");
  return pickLocale(locale, "Ranking", "Ranking");
}

function BlogCardGrid({
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
                <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                  {pickLocale(locale, post.titleEs, post.titleEn)}
                </Link>
              </h3>
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
        );
      })}
    </div>
  );
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const { guidesPage, productsPage } = parseBlogListPages(query);
  const { guides, products } = await listPublicBlogSections();
  const guidesPageData = paginateBlogCards(guides, guidesPage);
  const productsPageData = paginateBlogCards(products, productsPage);

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
            <a href="#guias" className="btn-secondary !w-auto !px-4 !py-2 text-sm">
              {pickLocale(locale, "Guías para la nieve", "Snow guides")}
            </a>
            <a href="#productos" className="btn-secondary !w-auto !px-4 !py-2 text-sm">
              {pickLocale(locale, "Productos", "Products")}
            </a>
          </div>
        </div>
      </section>

      <section id="guias" className="section-padding scroll-mt-[var(--header-offset)]">
        <div className="container-page">
          <SectionHeader
            eyebrow={pickLocale(locale, "Estación", "Resort")}
            title={pickLocale(locale, "Guías para la nieve", "Guides for the snow")}
            description={pickLocale(
              locale,
              "Consejos para clases, forfait, familias y tu primer día en Sierra Nevada. Ordenadas por las más leídas.",
              "Advice for lessons, lift passes, families and your first day in Sierra Nevada. Sorted by the most read.",
            )}
          />
          {guides.length === 0 ? (
            <div className="card mx-auto mt-8 max-w-xl text-center">
              <p className="text-sm text-muted">
                {pickLocale(
                  locale,
                  "Próximamente publicaremos consejos sobre esquí y snowboard en Sierra Nevada.",
                  "We will soon publish ski and snowboard tips for Sierra Nevada.",
                )}
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <BlogCardGrid posts={guidesPageData.items} locale={locale} />
              <BlogPagination
                locale={locale}
                page={guidesPageData.page}
                totalPages={guidesPageData.totalPages}
                totalItems={guidesPageData.totalItems}
                hrefForPage={(page) => blogHref(page, productsPageData.page, "#guias")}
                itemLabel={{
                  es: { singular: "guía", plural: "guías" },
                  en: { singular: "guide", plural: "guides" },
                }}
              />
            </div>
          )}
        </div>
      </section>

      <section id="productos" className="section-padding scroll-mt-[var(--header-offset)] bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow={pickLocale(locale, "Material", "Gear")}
            title={pickLocale(locale, "Productos", "Products")}
            description={pickLocale(
              locale,
              "Rankings y reviews de material de esquí y snowboard, pensados para Sierra Nevada, ordenados por popularidad. Como afiliados de Amazon, podemos recibir comisión por compras que cumplan los requisitos.",
              "Ski and snowboard rankings and reviews, written for Sierra Nevada and sorted by popularity. As an Amazon Associate, we may earn from qualifying purchases.",
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
              <BlogPagination
                locale={locale}
                page={productsPageData.page}
                totalPages={productsPageData.totalPages}
                totalItems={productsPageData.totalItems}
                hrefForPage={(page) => blogHref(guidesPageData.page, page, "#productos")}
                itemLabel={{
                  es: { singular: "producto", plural: "productos" },
                  en: { singular: "product", plural: "products" },
                }}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
