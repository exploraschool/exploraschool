"use client";

import { products, type Product, type ProductId } from "@/data/products";
import { getProductFromPrice, isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { ProductCardFooter } from "@/components/cart/ProductCardFooter";
import { PriceTag } from "@/components/PriceTag";

type LessonProductCatalogProps = {
  locale: string;
};

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-hielo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function priceSuffix(product: Product, locale: string): string | undefined {
  if (product.id === "curso-snow") {
    return pickLocale(locale, " / persona", " / person");
  }
  if (product.category === "full-day" || product.id === "curso-empresa") {
    return pickLocale(locale, " / día", " / day");
  }
  return undefined;
}

function ProductCard({
  product,
  locale,
  featured = false,
}: {
  product: Product;
  locale: string;
  featured?: boolean;
}) {
  const fromPrice = product.fromPrice ?? getProductFromPrice(product.id);
  const features = pickLocale(locale, product.featuresEs, product.featuresEn).slice(0, featured ? 4 : 3);

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white transition hover:border-accent/25 hover:shadow-[0_12px_32px_rgba(10,18,25,0.08)] ${
        featured ? "border-accent/20 p-6 shadow-[0_8px_24px_rgba(10,18,25,0.06)]" : "border-hielo/10 p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {featured && (
            <span className="mb-2 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent">
              {pickLocale(locale, "Popular", "Popular")}
            </span>
          )}
          <h3 className={`font-display font-semibold text-hielo ${featured ? "text-xl" : "text-lg"}`}>
            {pickLocale(locale, product.titleEs, product.titleEn)}
          </h3>
          {product.hours && (
            <p className="mt-1 text-xs font-medium text-muted">
              {product.hours} h · {pickLocale(locale, "1–8 participantes", "1–8 participants")}
            </p>
          )}
        </div>
        {product.id === "curso-snow" && (
          <span className="shrink-0 rounded-full bg-hielo/8 px-2 py-1 text-[0.65rem] font-semibold text-hielo">
            {pickLocale(locale, "mín. 3 · máx. 8", "min. 3 · max. 8")}
          </span>
        )}
        {product.id === "curso-empresa" && (
          <span className="shrink-0 rounded-full bg-hielo/8 px-2 py-1 text-[0.65rem] font-semibold text-hielo">
            {pickLocale(locale, "Jornada completa", "Full day")}
          </span>
        )}
      </div>

      <p className={`mt-3 text-muted ${featured ? "text-sm" : "text-sm line-clamp-2"}`}>
        {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
      </p>

      {fromPrice !== null && (
        <p className="mt-4">
          <PriceTag
            price={fromPrice}
            locale={locale}
            prefix={pickLocale(locale, "desde ", "from ")}
            suffix={priceSuffix(product, locale)}
            size={featured ? "lg" : "md"}
          />
        </p>
      )}

      <ul className="mt-4 flex-1 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <ProductCardFooter productId={product.id as ProductId} className="mt-5 !w-full" />
    </article>
  );
}

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
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} featured />
          ))}
        </div>
      </div>

      {others.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Más formatos", "More formats")}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {others.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
