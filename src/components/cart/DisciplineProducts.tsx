"use client";

import { products, type ProductId } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { productMatchesDiscipline, type MainDisciplineId } from "@/data/disciplines";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PriceTag } from "@/components/PriceTag";
import { pickLocale } from "@/lib/locale";
import { Reveal } from "@/components/Reveal";

type DisciplineProductsProps = {
  locale: string;
  disciplineId: MainDisciplineId;
};

export function DisciplineProducts({ locale, disciplineId }: DisciplineProductsProps) {
  const filtered = products
    .filter((p) => productMatchesDiscipline(p.disciplines, disciplineId) && isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (filtered.length === 0) {
    filtered.push(...products.filter((p) => p.highlighted).slice(0, 3));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((product, i) => (
        <Reveal key={product.id} delay={i * 80}>
          <article className="card-interactive flex h-full flex-col">
            <h3 className="font-display text-lg font-semibold text-hielo">
              {pickLocale(locale, product.titleEs, product.titleEn)}
            </h3>
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
              defaultDiscipline={disciplineId}
              className="mt-4 !w-full"
            />
          </article>
        </Reveal>
      ))}
    </div>
  );
}
