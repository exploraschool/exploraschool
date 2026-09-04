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
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-hielo/10 bg-white transition hover:border-accent/25 hover:shadow-[0_12px_32px_rgba(10,18,25,0.08)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-hielo/5">
        <Image
          src={product.image}
          alt={pickLocale(locale, product.titleEs, product.titleEn)}
          fill
          className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
            product.id === "curso-snow" ? "object-[center_72%]" : "object-center"
          }`}
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pizarra/35 via-transparent to-pizarra/10" />
        {badge ? (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white ${
              badgeVariant === "popular" ? "bg-accent-dark" : "bg-hielo"
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
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{summary}</p>

        {facts.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <li
                key={fact}
                className="rounded-full bg-hielo/8 px-2.5 py-0.5 text-[0.7rem] font-semibold text-hielo"
              >
                {fact}
              </li>
            ))}
          </ul>
        ) : null}

        {highlights.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
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
