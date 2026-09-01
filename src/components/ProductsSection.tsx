import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getHighlightedProducts } from "@/data/products";
import { pickLocale } from "@/lib/locale";

type ProductsSectionProps = {
  locale: string;
  showAllLink?: boolean;
};

export function ProductsSection({ locale, showAllLink = true }: ProductsSectionProps) {
  const products = getHighlightedProducts();

  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{pickLocale(locale, "Nuestras clases", "Our lessons")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(locale, "Formatos para cada día", "Formats for every day")}
            </h2>
          </div>
          {showAllLink && (
            <Link href="/clases" className="btn-secondary shrink-0">
              {pickLocale(locale, "Ver todas las clases", "View all lessons")}
            </Link>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-xl border border-hielo/10 bg-nieve shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-hielo/5">
                <Image
                  src={product.image}
                  alt={pickLocale(locale, product.titleEs, product.titleEn)}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.fromPrice && (
                  <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    {pickLocale(locale, "desde", "from")} {product.fromPrice} €
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-hielo">
                  {pickLocale(locale, product.titleEs, product.titleEn)}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-pizarra/80">
                  {pickLocale(locale, product.featuresEs, product.featuresEn)
                    .slice(0, 3)
                    .map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-oro" />
                        {f}
                      </li>
                    ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
