"use client";

import Image from "next/image";
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
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hielo/10 bg-white transition hover:border-accent/25 hover:shadow-[0_12px_32px_rgba(10,18,25,0.08)]">
              <div className="relative overflow-hidden px-4 pb-3.5 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-white/78" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />

                <div className="relative">
                  {snowboardOnly ? (
                    <span className="mb-2 inline-block rounded-full bg-hielo px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                      {pickLocale(locale, "Snowboard", "Snowboard")}
                    </span>
                  ) : null}
                  <h3 className="font-display text-lg font-semibold text-hielo">
                    {pickLocale(locale, product.titleEs, product.titleEn)}
                  </h3>
                  <p className="mt-2 text-sm text-muted line-clamp-2">
                    {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col border-t border-hielo/6 p-4 sm:p-5">
                {product.fromPrice ? (
                  <p>
                    <PriceTag
                      price={product.fromPrice}
                      locale={locale}
                      prefix={pickLocale(locale, "desde ", "from ")}
                      size="sm"
                    />
                  </p>
                ) : null}
                <AddToCartButton
                  productId={product.id as ProductId}
                  defaultDiscipline={defaultDisciplineForProduct(
                    product,
                    disciplineId,
                    alsoIncludeDisciplineIds,
                  )}
                  className="mt-4 !w-full"
                />
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
