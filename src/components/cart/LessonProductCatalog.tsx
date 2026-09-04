"use client";

import Image from "next/image";
import { products, type Product, type ProductId } from "@/data/products";
import { getProductFromPrice, isBookableProduct } from "@/lib/product-pricing";
import { pickLocale } from "@/lib/locale";
import { ProductCardFooter } from "@/components/cart/ProductCardFooter";
import { PriceTag } from "@/components/PriceTag";
import { CURSO_COLECTIVO_HOURLY_EUR, FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";

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

function participantsLabel(product: Product, locale: string): string {
  const min = product.minPeople ?? 1;
  const max = product.maxPeople ?? 8;
  if (product.id === "curso-snow" || min > 1) {
    return pickLocale(locale, `a partir de ${min} participantes`, `from ${min} participants`);
  }
  return pickLocale(locale, `${min}–${max} participantes`, `${min}–${max} participants`);
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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:border-accent/25 hover:shadow-[0_12px_32px_rgba(10,18,25,0.08)] ${
        featured ? "border-accent/20 shadow-[0_8px_24px_rgba(10,18,25,0.06)]" : "border-hielo/10"
      }`}
    >
      <div
        className={`relative isolate overflow-hidden ${
          featured ? "px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6" : "px-4 pb-3.5 pt-4 sm:px-5 sm:pb-4 sm:pt-5"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-white/80" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {featured ? (
              <span className="mb-2 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-dark">
                {pickLocale(locale, "Popular", "Popular")}
              </span>
            ) : null}
            <h3 className={`font-display font-semibold text-hielo ${featured ? "text-xl" : "text-lg"}`}>
              {pickLocale(locale, product.titleEs, product.titleEn)}
            </h3>
            {product.hours ? (
              <p className="mt-1 text-xs font-medium text-muted">
                {product.hours} h · {participantsLabel(product, locale)}
              </p>
            ) : null}
          </div>
          {product.id === "curso-snow" ? (
            <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[0.65rem] font-semibold text-hielo backdrop-blur-sm">
              {pickLocale(locale, "a partir de 4", "from 4 people")}
            </span>
          ) : null}
          {product.id === "curso-empresa" ? (
            <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[0.65rem] font-semibold text-hielo backdrop-blur-sm">
              {pickLocale(locale, "Jornada completa", "Full day")}
            </span>
          ) : null}
        </div>

        <p className={`mt-3 text-muted ${featured ? "text-sm" : "text-sm line-clamp-2"}`}>
          {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
        </p>
      </div>

      <div
        className={`mt-auto flex flex-1 flex-col border-t border-hielo/6 ${
          featured ? "p-5 sm:p-6" : "p-4 sm:p-5"
        }`}
      >
        {fromPrice !== null ? (
          <p>
            <PriceTag
              price={fromPrice}
              locale={locale}
              productId={product.id}
              prefix={pickLocale(locale, "desde ", "from ")}
              suffix={priceSuffix(product, locale)}
              size={featured ? "lg" : "md"}
            />
            {product.category === "full-day" ? (
              <span className="mt-1 block text-xs font-semibold text-hielo">
                {pickLocale(
                  locale,
                  `Mejor precio: ${FULL_DAY_HOURLY_EUR} €/h`,
                  `Best rate: €${FULL_DAY_HOURLY_EUR}/h`,
                )}
              </span>
            ) : null}
            {product.id === "curso-snow" ? (
              <span className="mt-1 block text-xs font-semibold text-hielo">
                {pickLocale(
                  locale,
                  `~${CURSO_COLECTIVO_HOURLY_EUR} €/h por persona · 3 h · mín. 4`,
                  `~€${CURSO_COLECTIVO_HOURLY_EUR}/h per person · 3 h · min. 4`,
                )}
              </span>
            ) : null}
          </p>
        ) : null}

        <ul className={`${fromPrice !== null ? "mt-4" : ""} flex-1 space-y-2`}>
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-muted">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <ProductCardFooter productId={product.id as ProductId} className="mt-5 !w-full" />
      </div>
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
        <div className="mt-4 grid items-stretch gap-5 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} featured />
          ))}
        </div>
      </div>

      {others.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-hielo">
            {pickLocale(locale, "Más formatos", "More formats")}
          </h3>
          <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2">
            {others.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
