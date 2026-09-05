"use client";

import Image from "next/image";
import type { MainDisciplineId } from "@/data/disciplines";
import type { Product, ProductId } from "@/data/products";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PriceTag } from "@/components/PriceTag";
import { pickLocale } from "@/lib/locale";
import {
  productCardHighlights,
  productFacts,
  productHourlyHook,
  productImageAlt,
  productPricePrefix,
  productPriceSuffix,
} from "@/lib/product-card";
import { getProductFromPrice } from "@/lib/product-pricing";

type LessonOfferCardProps = {
  product: Product;
  locale: string;
  badge?: string;
  badgeVariant?: "discipline" | "popular";
  defaultDiscipline?: MainDisciplineId;
};

export function LessonOfferCard({
  product,
  locale,
  badge,
  badgeVariant = "discipline",
  defaultDiscipline,
}: LessonOfferCardProps) {
  const fromPrice = product.fromPrice ?? getProductFromPrice(product.id);
  const facts = productFacts(product, locale);
  const highlights = productCardHighlights(product, locale);
  const hourly = productHourlyHook(product, locale);
  const summary = pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn);

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_2px_16px_rgba(14,14,15,0.04)] transition hover:border-accent/25 hover:shadow-[0_16px_40px_rgba(10,18,25,0.10)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-hielo/5">
        <Image
          src={product.image}
          alt={productImageAlt(product, locale)}
          fill
          className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 639px) 85vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pizarra/50 via-pizarra/10 to-transparent" />
        {badge ? (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
              badgeVariant === "popular"
                ? "bg-oro font-bold tracking-wider text-pizarra"
                : "bg-hielo text-white"
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-hielo">
          {pickLocale(locale, product.titleEs, product.titleEn)}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-pizarra/75">{summary}</p>

        {facts.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <li
                key={fact}
                className="rounded-full bg-nieve px-2.5 py-0.5 text-[0.7rem] font-semibold text-hielo"
              >
                {fact}
              </li>
            ))}
          </ul>
        ) : null}

        {highlights.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-pizarra">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-oro"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-4">
          {fromPrice !== null ? (
            <p>
              <PriceTag
                price={fromPrice}
                locale={locale}
                productId={product.id}
                prefix={productPricePrefix(product, locale)}
                suffix={productPriceSuffix(product, locale)}
                size="md"
              />
              {hourly ? (
                <span className="mt-0.5 block text-xs font-semibold text-hielo">{hourly}</span>
              ) : null}
            </p>
          ) : null}
          <AddToCartButton
            productId={product.id as ProductId}
            defaultDiscipline={defaultDiscipline}
            className="!w-full"
          />
        </div>
      </div>
    </article>
  );
}
