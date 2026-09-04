"use client";

import type { ReactNode } from "react";
import { products, type Product } from "@/data/products";
import { isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { LessonOfferCard } from "@/components/cart/LessonOfferCard";

type LessonProductCatalogProps = {
  locale: string;
};

const carouselClass =
  "x-scroller x-scroller--bleed mt-3 flex snap-x snap-mandatory gap-4 pb-2 sm:mt-4 sm:overflow-visible sm:snap-none sm:pb-0";

function CatalogSlide({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-[min(19.5rem,calc(100%-2.75rem))] shrink-0 snap-start sm:min-w-0 sm:w-auto ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function CatalogCards({
  products: list,
  locale,
  popular,
  desktopClassName,
  slideClassName,
}: {
  products: Product[];
  locale: string;
  popular?: boolean;
  desktopClassName: string;
  slideClassName?: string;
}) {
  return (
    <HorizontalScroller
      className={`${carouselClass} ${desktopClassName}`}
      label={
        popular
          ? pickLocale(locale, "Los más elegidos", "Most popular")
          : pickLocale(locale, "Otros formatos", "More formats")
      }
      prevLabel={pickLocale(locale, "Clase anterior", "Previous lesson")}
      nextLabel={pickLocale(locale, "Clase siguiente", "Next lesson")}
    >
      {list.map((product) => (
        <CatalogSlide key={product.id} className={slideClassName}>
          <LessonOfferCard
            product={product}
            locale={locale}
            badge={popular ? pickLocale(locale, "Popular", "Popular") : undefined}
            badgeVariant={popular ? "popular" : "discipline"}
          />
        </CatalogSlide>
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
        <CatalogCards
          products={featured}
          locale={locale}
          popular
          desktopClassName="sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        />
      </div>

      {others.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Otros formatos", "More formats")}
          </h3>
          <CatalogCards
            products={others}
            locale={locale}
            desktopClassName="sm:flex-wrap sm:justify-center"
            slideClassName="sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
          />
        </div>
      ) : null}
    </div>
  );
}
