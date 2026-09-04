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

        <div
          className={`x-scroller x-scroller--bleed flex snap-x snap-mandatory gap-4 pb-2 sm:grid sm:overflow-visible sm:snap-none sm:pb-0 lg:grid-cols-3 ${
            compact ? "mt-6 sm:mt-8 sm:grid-cols-2 sm:gap-5" : "section-body sm:grid-cols-2 md:gap-6"
          }`}
          role="list"
          aria-label={pickLocale(locale, "Los más reservados", "Most booked")}
        >
          {products.map((product, i) => (
            <Reveal
              key={product.id}
              delay={i * 80}
              className="flex w-[min(19.5rem,calc(100%-2.75rem))] shrink-0 snap-start sm:min-w-0 sm:w-auto"
            >
              <LessonOfferCard product={product} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
