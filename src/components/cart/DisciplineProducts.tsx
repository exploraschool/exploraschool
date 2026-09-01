"use client";

import { products, type Product, type ProductId } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { productMatchesDiscipline, type MainDisciplineId } from "@/data/disciplines";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PriceTag } from "@/components/PriceTag";
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((product, i) => {
        const snowboardOnly =
          alsoIncludeDisciplineIds.includes("snowboard") &&
          isExclusiveToDiscipline(product, "snowboard");

        return (
          <Reveal key={product.id} delay={i * 80}>
            <article className="card-interactive flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-hielo">
                  {pickLocale(locale, product.titleEs, product.titleEn)}
                </h3>
                {snowboardOnly && (
                  <span className="rounded-full bg-hielo/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-hielo">
                    {pickLocale(locale, "Snowboard", "Snowboard")}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">
                {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
              </p>
              {product.fromPrice && (
                <p className="mt-3">
                  <PriceTag
                    price={product.fromPrice}
                    locale={locale}
                    prefix={pickLocale(locale, "desde ", "from ")}
                    size="sm"
                  />
                </p>
              )}
              <AddToCartButton
                productId={product.id as ProductId}
                defaultDiscipline={defaultDisciplineForProduct(
                  product,
                  disciplineId,
                  alsoIncludeDisciplineIds,
                )}
                className="mt-4 !w-full"
              />
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
