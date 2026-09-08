import { setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogCardGrid } from "@/components/blog/BlogCardGrid";
import { BlogPagination } from "@/components/BlogPagination";
import { SectionHeader } from "@/components/SectionHeader";
import { listPublicBlogSections, paginateBlogCards } from "@/lib/blog-catalog";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { localizedPath } from "@/lib/seo-urls";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; page?: string }>;
};

function parsePage(raw?: string): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await params;
  const pageNum = parsePage(page);
  const path = pageNum > 1 ? `/blog/productos/${pageNum}` : "/blog/productos";
  return buildPageMetadata({
    locale,
    path,
    title: pickLocale(
      locale,
      pageNum > 1
        ? `Material de esquí y snowboard: rankings y reviews (página ${pageNum})`
        : "Material de esquí y snowboard: rankings y reviews",
      pageNum > 1
        ? `Ski and snowboard gear: rankings and reviews (page ${pageNum})`
        : "Ski and snowboard gear: rankings and reviews",
    ),
    description: pickLocale(
      locale,
      "Rankings y reviews de material de esquí y snowboard para Sierra Nevada: gafas, cascos y equipo recomendado.",
      "Ski and snowboard gear rankings and reviews for Sierra Nevada: goggles, helmets and recommended kit.",
    ),
  });
}

export default async function BlogProductsPage({ params }: Props) {
  const { locale, page: rawPage } = await params;
  setRequestLocale(locale);
  const pageNum = parsePage(rawPage);
  if (rawPage && pageNum === 1) {
    permanentRedirect(localizedPath(locale, "/blog/productos"));
  }

  const { products } = await listPublicBlogSections(locale);
  const data = paginateBlogCards(products, pageNum);
  if (pageNum > 1 && data.page !== pageNum) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "Blog", path: "/blog" },
          { name: pickLocale(locale, "Productos", "Gear"), path: "/blog/productos" },
        ]}
      />
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow={pickLocale(locale, "Material", "Gear")}
            title={pickLocale(locale, "Productos", "Products")}
            description={pickLocale(
              locale,
              "Rankings y reviews de material de esquí y snowboard, pensados para Sierra Nevada, ordenados por popularidad.",
              "Ski and snowboard rankings and reviews, written for Sierra Nevada and sorted by popularity.",
            )}
          />
          <div className="mt-8">
            <BlogCardGrid posts={data.items} locale={locale} />
            <BlogPagination
              locale={locale}
              page={data.page}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              hrefForPage={(page) =>
                page <= 1
                  ? "/blog/productos"
                  : { pathname: "/blog/productos/[page]", params: { page: String(page) } }
              }
              itemLabel={{
                es: { singular: "producto", plural: "productos" },
                en: { singular: "product", plural: "products" },
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
