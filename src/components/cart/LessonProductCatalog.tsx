"use client";

import { products } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";

type LessonProductCatalogProps = {
  locale: string;
};

export function LessonProductCatalog({ locale }: LessonProductCatalogProps) {
  const bookable = products
    .filter((p) => isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const featured = bookable.filter((p) => p.highlighted);
  const others = bookable.filter((p) => !p.highlighted);

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
          {pickLocale(locale, "Los más elegidos", "Most popular")}
        </h3>
        <div className="mt-4 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <LessonOfferCard
              key={product.id}
              product={product}
              locale={locale}
              badge={pickLocale(locale, "Popular", "Popular")}
              badgeVariant="popular"
            />
          ))}
        </div>
      </div>

      {others.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Más formatos", "More formats")}
          </h3>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {others.map((product) => (
              <div
                key={product.id}
                className="flex w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
              >
                <LessonOfferCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
