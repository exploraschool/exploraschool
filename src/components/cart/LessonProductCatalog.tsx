"use client";

import { products, type Product } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";
import { productCardsClass } from "@/lib/product-cards-layout";

type LessonProductCatalogProps = {
  locale: string;
};

function CatalogCards({
  products: list,
  locale,
  popular,
}: {
  products: Product[];
  locale: string;
  popular?: boolean;
}) {
  return (
    <HorizontalScroller
      className={productCardsClass(list.length, "mt-3 sm:mt-4")}
      label={
        popular
          ? pickLocale(locale, "Los más elegidos", "Most popular")
          : pickLocale(locale, "Otros formatos", "More formats")
      }
      prevLabel={pickLocale(locale, "Clase anterior", "Previous lesson")}
      nextLabel={pickLocale(locale, "Clase siguiente", "Next lesson")}
    >
      {list.map((product) => (
        <LessonOfferCard
          key={product.id}
          product={product}
          locale={locale}
          badge={popular ? pickLocale(locale, "Popular", "Popular") : undefined}
          badgeVariant={popular ? "popular" : "discipline"}
        />
      ))}
    </HorizontalScroller>
  );
}

export function LessonProductCatalog({ locale }: LessonProductCatalogProps) {
  const bookable = products
    .filter((p) => isBookableProduct(p.season))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const featured = bookable.filter((p) => p.highlighted);
  const others = bookable.filter((p) => !p.highlighted);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
          {pickLocale(locale, "Los más elegidos", "Most popular")}
        </h3>
        <CatalogCards products={featured} locale={locale} popular />
      </div>

      {others.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Otros formatos", "More formats")}
          </h3>
          <CatalogCards products={others} locale={locale} />
        </div>
      ) : null}
    </div>
  );
}
