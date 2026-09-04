"use client";

import { currentPrices } from "@/data/prices";
import { pickLocale } from "@/lib/locale";
import { ProductCardFooter } from "@/components/cart/ProductCardFooter";
import { PriceTag } from "@/components/PriceTag";
import type { ProductId } from "@/data/products";

type CurrentPriceCardsProps = {
  locale: string;
};

export function CurrentPriceCards({ locale }: CurrentPriceCardsProps) {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {currentPrices.map((price) => (
        <article key={price.id} className="card-interactive flex h-full flex-col">
          <h3 className="font-display text-xl font-semibold">
            {pickLocale(locale, price.titleEs, price.titleEn)}
          </h3>
          {price.fromPrice && (
            <p className="mt-2">
              <PriceTag
                price={price.fromPrice}
                locale={locale}
                productId={price.productId as ProductId}
                prefix={pickLocale(locale, "desde ", "from ")}
                suffix={
                  price.unit === "person"
                    ? pickLocale(locale, " / persona", " / person")
                    : pickLocale(locale, " / día", " / day")
                }
                size="lg"
              />
            </p>
          )}
          <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
            {pickLocale(locale, price.featuresEs, price.featuresEn).map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          {price.extras?.map((extra) => (
            <p key={extra.labelEs} className="mt-3 text-sm font-medium text-hielo">
              {pickLocale(locale, extra.labelEs, extra.labelEn)}: {extra.value}
            </p>
          ))}
          <ProductCardFooter productId={price.productId as ProductId} />
        </article>
      ))}
    </div>
  );
}
