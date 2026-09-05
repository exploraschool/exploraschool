import { Link } from "@/i18n/routing";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getHighlightedProducts } from "@/data/products";
import { pickLocale } from "@/lib/locale";
import { productCardsClass } from "@/lib/product-cards-layout";

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
          <div className="flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <SectionHeader
                eyebrow={pickLocale(locale, compact ? "Clases" : "Nuestras clases", compact ? "Lessons" : "Our lessons")}
                title={pickLocale(
                  locale,
                  compact ? "Los más reservados" : "Formatos para cada día",
                  compact ? "Most booked" : "Formats for every day",
                )}
              />
            </div>
            {showAllLink && (
              <Link href="/clases" className="btn-secondary shrink-0 !w-auto">
                {pickLocale(locale, compact ? "Ver todos" : "Ver todas las clases", compact ? "View all" : "View all lessons")}
              </Link>
            )}
          </div>
        </Reveal>

        <HorizontalScroller
          className={productCardsClass(products.length, compact ? "mt-6 sm:mt-8" : "section-body")}
          label={pickLocale(locale, "Los más reservados", "Most booked")}
          prevLabel={pickLocale(locale, "Clase anterior", "Previous lesson")}
          nextLabel={pickLocale(locale, "Clase siguiente", "Next lesson")}
        >
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 80} className="flex h-full min-w-0">
              <LessonOfferCard product={product} locale={locale} />
            </Reveal>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
