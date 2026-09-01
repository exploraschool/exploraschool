"use client";

import { products, type ProductId } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { ProductCardFooter } from "@/components/cart/ProductCardFooter";
import { PriceTag } from "@/components/PriceTag";

type PriceProductCardsProps = {
  locale: string;
};

export function PriceProductCards({ locale }: PriceProductCardsProps) {
  const list = products
    .filter((p) => isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((product) => (
        <article key={product.id} className="card-interactive flex h-full flex-col">
          <h3 className="font-semibold text-pizarra">
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
          <ProductCardFooter productId={product.id as ProductId} />
        </article>
      ))}
    </div>
  );
}
