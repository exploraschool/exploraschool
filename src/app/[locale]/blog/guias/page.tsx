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
  const path = pageNum > 1 ? `/blog/guias/${pageNum}` : "/blog/guias";
  return buildPageMetadata({
    locale,
    path,
    title: pickLocale(
      locale,
      pageNum > 1
        ? `Guías de esquí y snowboard en Sierra Nevada (página ${pageNum})`
        : "Guías de esquí y snowboard en Sierra Nevada",
      pageNum > 1
        ? `Ski and snowboard guides for Sierra Nevada (page ${pageNum})`
        : "Ski and snowboard guides for Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Guías de esquí y snowboard en Sierra Nevada: clases, forfait, familias, seguridad y qué llevar el primer día.",
      "Ski and snowboard guides for Sierra Nevada: lessons, lift passes, families, safety and what to pack for day one.",
    ),
  });
}

export default async function BlogGuidesPage({ params }: Props) {
  const { locale, page: rawPage } = await params;
  setRequestLocale(locale);
  const pageNum = parsePage(rawPage);
  if (!rawPage) {
    // /blog/guias (page 1)
  } else if (pageNum === 1) {
    permanentRedirect(localizedPath(locale, "/blog/guias"));
  }

  const { guides } = await listPublicBlogSections(locale);
  const data = paginateBlogCards(guides, pageNum);
  if (pageNum > 1 && data.page !== pageNum) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "Blog", path: "/blog" },
          { name: pickLocale(locale, "Guías", "Guides"), path: "/blog/guias" },
        ]}
      />
      <section className="section-padding">
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
          <div className="mt-8">
            <BlogCardGrid posts={data.items} locale={locale} />
            <BlogPagination
              locale={locale}
              page={data.page}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              hrefForPage={(page) =>
                page <= 1
                  ? "/blog/guias"
                  : { pathname: "/blog/guias/[page]", params: { page: String(page) } }
              }
              itemLabel={{
                es: { singular: "guía", plural: "guías" },
                en: { singular: "guide", plural: "guides" },
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
