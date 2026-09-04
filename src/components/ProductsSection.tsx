import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ProductCardFooter } from "@/components/cart/ProductCardFooter";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getHighlightedProducts } from "@/data/products";
import { pickLocale } from "@/lib/locale";
import { resolvePriceDisplay } from "@/lib/promotions";

type ProductsSectionProps = {
  locale: string;
  showAllLink?: boolean;
  limit?: number;
  compact?: boolean;
};

export function ProductsSection({
  locale,
  showAllLink = true,
  limit,
  compact = false,
}: ProductsSectionProps) {
  const products = getHighlightedProducts().slice(0, limit);

  if (compact) {
    return (
      <section className="section-padding-sm bg-white">
        <div className="container-page">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeader
                eyebrow={pickLocale(locale, "Clases", "Lessons")}
                title={pickLocale(locale, "Los más reservados", "Most booked")}
              />
              {showAllLink && (
                <Link href="/clases" className="btn-secondary shrink-0 !w-auto">
                  {pickLocale(locale, "Ver todos", "View all")}
                </Link>
              )}
            </div>
          </Reveal>

          <div className="mt-6 grid gap-5 sm:mt-8 lg:grid-cols-3">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 80}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-hielo/8 bg-white transition hover:border-accent/20 hover:shadow-[0_12px_32px_rgba(10,18,25,0.08)]">
                  <div className="relative aspect-[16/9] bg-hielo/5">
                    <Image
                      src={product.image}
                      alt={pickLocale(locale, product.titleEs, product.titleEn)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    {product.fromPrice && (() => {
                      const price = resolvePriceDisplay(product.fromPrice, new Date(), product.id);
                      return (
                        <span className="absolute right-3 top-3 rounded-full bg-accent-dark px-2.5 py-0.5 text-xs font-bold text-white">
                          {pickLocale(locale, "desde", "from")} {price.finalPrice} €
                          {price.discountActive && (
                            <span className="ml-1 text-white">(-{price.discountPercent}%)</span>
                          )}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-semibold text-hielo">
                      {pickLocale(locale, product.titleEs, product.titleEn)}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted line-clamp-2">
                      {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
                    </p>
                    <ProductCardFooter productId={product.id} className="mt-4 !w-full" />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow={pickLocale(locale, "Nuestras clases", "Our lessons")}
              title={pickLocale(locale, "Formatos para cada día", "Formats for every day")}
            />
            {showAllLink && (
              <Link href="/clases" className="btn-secondary shrink-0 md:!w-auto">
                {pickLocale(locale, "Ver todas las clases", "View all lessons")}
              </Link>
            )}
          </div>
        </Reveal>

        <div className="section-body grid gap-6 lg:grid-cols-2">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 100}>
              <article className="card-interactive group h-full overflow-hidden p-0">
                <div className="relative aspect-[16/10] bg-hielo/5">
                  <Image
                    src={product.image}
                    alt={pickLocale(locale, product.titleEs, product.titleEn)}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pizarra/70 to-transparent" />
                  {product.fromPrice && (() => {
                    const price = resolvePriceDisplay(product.fromPrice, new Date(), product.id);
                    return (
                      <span className="absolute right-3 top-3 rounded-full bg-accent-dark px-3 py-1 text-xs font-bold text-white">
                        {pickLocale(locale, "desde", "from")} {price.finalPrice} €
                        {price.discountActive && (
                          <span className="ml-1 text-white">(-{price.discountPercent}%)</span>
                        )}
                      </span>
                    );
                  })()}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {pickLocale(locale, product.titleEs, product.titleEn)}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted">
                    {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
                  </p>
                  <ProductCardFooter productId={product.id} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
