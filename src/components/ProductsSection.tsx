import { Link } from "@/i18n/routing";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getHighlightedProducts } from "@/data/products";
import { pickLocale } from "@/lib/locale";

type ProductsSectionProps = {
  locale: string;
  showAllLink?: boolean;
  limit?: number;
  compact?: boolean;
};

export function ProductsSection({
  locale,
  showAllLink = true,
  limit,
  compact = false,
}: ProductsSectionProps) {
  const products = getHighlightedProducts().slice(0, limit);

  return (
    <section className={compact ? "section-padding-sm bg-white" : "section-padding bg-white"}>
      <div className="container-page">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow={pickLocale(locale, compact ? "Clases" : "Nuestras clases", compact ? "Lessons" : "Our lessons")}
              title={pickLocale(
                locale,
                compact ? "Los más reservados" : "Formatos para cada día",
                compact ? "Most booked" : "Formats for every day",
              )}
            />
            {showAllLink && (
              <Link href="/clases" className="btn-secondary shrink-0 !w-auto">
                {pickLocale(locale, compact ? "Ver todos" : "Ver todas las clases", compact ? "View all" : "View all lessons")}
              </Link>
            )}
          </div>
        </Reveal>

        <div className={`grid items-stretch gap-5 ${compact ? "mt-6 sm:mt-8 lg:grid-cols-3" : "section-body lg:grid-cols-3"}`}>
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 80}>
              <LessonOfferCard product={product} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
