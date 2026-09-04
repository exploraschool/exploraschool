"use client";

import { products, type Product } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { productMatchesDiscipline, type MainDisciplineId } from "@/data/disciplines";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";
import { pickLocale } from "@/lib/locale";
import { Reveal } from "@/components/Reveal";

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

export function DisciplineProducts({
  locale,
  disciplineId,
  alsoIncludeDisciplineIds = [],
}: DisciplineProductsProps) {
  const disciplineIds = [disciplineId, ...alsoIncludeDisciplineIds];

  const filtered = products
    .filter((p) => matchesAnyDiscipline(p, disciplineIds) && isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (filtered.length === 0) {
    filtered.push(...products.filter((p) => p.highlighted).slice(0, 3));
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {filtered.map((product, i) => {
        const snowboardOnly =
          alsoIncludeDisciplineIds.includes("snowboard") &&
          isExclusiveToDiscipline(product, "snowboard");

        return (
          <Reveal
            key={product.id}
            delay={i * 80}
            className="flex w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
          >
            <LessonOfferCard
              product={product}
              locale={locale}
              badge={snowboardOnly ? pickLocale(locale, "Snowboard", "Snowboard") : undefined}
              defaultDiscipline={defaultDisciplineForProduct(
                product,
                disciplineId,
                alsoIncludeDisciplineIds,
              )}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
