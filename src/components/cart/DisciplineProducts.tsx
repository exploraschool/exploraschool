"use client";

import { products, type Product } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { productMatchesDiscipline, type MainDisciplineId } from "@/data/disciplines";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";
import { pickLocale } from "@/lib/locale";

type DisciplineProductsProps = {
  locale: string;
  disciplineId: MainDisciplineId;
  /** Extra disciplines to list (e.g. snowboard classes on the ski page). */
  alsoIncludeDisciplineIds?: MainDisciplineId[];
};

function matchesAnyDiscipline(product: Product, disciplineIds: MainDisciplineId[]): boolean {
  return disciplineIds.some((id) => productMatchesDiscipline(product.disciplines, id));
}

function defaultDisciplineForProduct(
  product: Product,
  primaryId: MainDisciplineId,
  alsoInclude: MainDisciplineId[],
): MainDisciplineId {
  if (productMatchesDiscipline(product.disciplines, primaryId)) return primaryId;
  const extra = alsoInclude.find((id) => productMatchesDiscipline(product.disciplines, id));
  return extra ?? primaryId;
}

function isExclusiveToDiscipline(product: Product, disciplineId: MainDisciplineId): boolean {
  return productMatchesDiscipline(product.disciplines, disciplineId) && product.disciplines.length === 1;
}

function ProductScroller({
  list,
  locale,
  popular,
  disciplineId,
  alsoIncludeDisciplineIds,
  desktopClassName,
  slideClassName = "",
}: {
  list: Product[];
  locale: string;
  popular?: boolean;
  disciplineId: MainDisciplineId;
  alsoIncludeDisciplineIds: MainDisciplineId[];
  desktopClassName: string;
  slideClassName?: string;
}) {
  return (
    <HorizontalScroller
      className={`x-scroller x-scroller--bleed mt-3 flex snap-x snap-mandatory gap-4 pb-2 sm:mt-4 sm:overflow-visible sm:snap-none sm:pb-0 ${desktopClassName}`}
      label={
        popular
          ? pickLocale(locale, "Los más elegidos", "Most popular")
          : pickLocale(locale, "Otros formatos", "More formats")
      }
      prevLabel={pickLocale(locale, "Clase anterior", "Previous lesson")}
      nextLabel={pickLocale(locale, "Clase siguiente", "Next lesson")}
    >
      {list.map((product) => {
        const snowboardOnly =
          alsoIncludeDisciplineIds.includes("snowboard") &&
          isExclusiveToDiscipline(product, "snowboard");

        return (
          <div
            key={product.id}
            role="listitem"
            className={`flex w-[min(19.5rem,calc(100%-2.75rem))] shrink-0 snap-start sm:min-w-0 sm:w-auto ${slideClassName}`.trim()}
          >
            <LessonOfferCard
              product={product}
              locale={locale}
              badge={
                popular
                  ? pickLocale(locale, "Popular", "Popular")
                  : snowboardOnly
                    ? pickLocale(locale, "Snowboard", "Snowboard")
                    : undefined
              }
              badgeVariant={popular ? "popular" : "discipline"}
              defaultDiscipline={defaultDisciplineForProduct(
                product,
                disciplineId,
                alsoIncludeDisciplineIds,
              )}
            />
          </div>
        );
      })}
    </HorizontalScroller>
  );
}

export function DisciplineProducts({
  locale,
  disciplineId,
  alsoIncludeDisciplineIds = [],
}: DisciplineProductsProps) {
  const disciplineIds = [disciplineId, ...alsoIncludeDisciplineIds];

  let filtered = products
    .filter((p) => matchesAnyDiscipline(p, disciplineIds) && isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (filtered.length === 0) {
    filtered = products
      .filter((p) => isBookableProduct(p.season))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const featured = filtered.filter((p) => p.highlighted);
  const others = filtered.filter((p) => !p.highlighted);

  return (
    <div className="space-y-8 sm:space-y-10">
      {featured.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Los más elegidos", "Most popular")}
          </h3>
          <ProductScroller
            list={featured}
            locale={locale}
            popular
            disciplineId={disciplineId}
            alsoIncludeDisciplineIds={alsoIncludeDisciplineIds}
            desktopClassName="sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          />
        </div>
      ) : null}

      {others.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Otros formatos", "More formats")}
          </h3>
          <ProductScroller
            list={others}
            locale={locale}
            disciplineId={disciplineId}
            alsoIncludeDisciplineIds={alsoIncludeDisciplineIds}
            desktopClassName="sm:flex-wrap sm:justify-center"
            slideClassName="sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
          />
        </div>
      ) : null}
    </div>
  );
}
