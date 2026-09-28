import Image from "next/image";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getProductBySlug } from "@/data/products";
import { site } from "@/data/site";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CTASection } from "@/components/CTASection";
import { PriceTag } from "@/components/PriceTag";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import {
  productAudience,
  productIncludeLines,
  productMetaDescription,
  productPriceRangeCopy,
  productSeoTitle,
} from "@/lib/product-landing-copy";
import { getProductOfferRange } from "@/lib/product-offer";
import { productImageAlt, productPricePrefix, productPriceSuffix } from "@/lib/product-card";
import { getProductFromPrice } from "@/lib/product-pricing";
import { productPath, type IndexableProductId } from "@/lib/seo-urls";

type ProductLandingProps = {
  locale: string;
  productId: IndexableProductId;
};

export function productLandingMetadata(locale: string, productId: IndexableProductId): Metadata {
  const product = getProductBySlug(productId);
  const path = productPath(productId);
  if (!product || !path) return {};

  return buildPageMetadata({
    locale,
    path,
    title: productSeoTitle(locale, productId),
    description: productMetaDescription(locale, productId),
    ogImage: product.image,
    ogImageAlt: productImageAlt(product, locale),
  });
}

export async function ProductLanding({ locale, productId }: ProductLandingProps) {
  setRequestLocale(locale);
  const product = getProductBySlug(productId);
  const path = productPath(productId);
  const range = getProductOfferRange(productId);
  if (!product || !path || !range) return null;

  const title = pickLocale(locale, product.titleEs, product.titleEn);
  const fromPrice = product.fromPrice ?? getProductFromPrice(product.id);
  const includes = productIncludeLines(product, locale);
  const rangeCopy = productPriceRangeCopy(locale, productId, range, product.minPeople ?? 1);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: pickLocale(locale, "Clases", "Lessons"), path: "/clases" },
          { name: title, path },
        ]}
      />
      <ProductJsonLd locale={locale} productId={productId} />

      <section className="relative overflow-hidden border-b border-hielo/10 bg-white">
        <div className="container-page grid items-center gap-8 py-10 sm:py-12 md:grid-cols-2 md:gap-12 md:py-16">
          <div>
            <nav aria-label={pickLocale(locale, "Migas de pan", "Breadcrumb")}>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <li>
                  <Link href="/" className="font-semibold text-hielo hover:text-accent-dark">
                    {pickLocale(locale, "Inicio", "Home")}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/clases" className="font-semibold text-hielo hover:text-accent-dark">
                    {pickLocale(locale, "Clases", "Lessons")}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">{title}</li>
              </ol>
            </nav>

            <h1 className="page-title mt-4">{title}</h1>
            <p className="page-lead">
              {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
            </p>

            {fromPrice !== null ? (
              <p className="mt-5">
                <PriceTag
                  price={fromPrice}
                  locale={locale}
                  productId={product.id}
                  prefix={productPricePrefix(product, locale)}
                  suffix={productPriceSuffix(product, locale)}
                  size="lg"
                />
              </p>
            ) : null}

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-pizarra/80">{rangeCopy}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddToCartButton
                productId={product.id}
                defaultDiscipline={productId === "curso-snow" ? "snowboard" : undefined}
                className="!w-full sm:!w-auto"
              />
              <Link
                href="/tarifas"
                className="text-sm font-semibold text-hielo underline decoration-hielo/25 underline-offset-2 hover:decoration-hielo"
              >
                {pickLocale(
                  locale,
                  "Ver el precio según el número de personas",
                  "See the price by group size",
                )}
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={product.image}
              alt={productImageAlt(product, locale)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="section-padding bg-nieve">
        <div className="container-page grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="section-title">
              {pickLocale(locale, "Qué incluye", "What's included")}
            </h2>
            <ul className="mt-5 space-y-2.5">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-pizarra">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-oro"
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
          </div>

          <div>
            <h2 className="section-title">
              {pickLocale(locale, "Para quién es", "Who it is for")}
            </h2>
            <p className="section-intro mt-4">{productAudience(locale, productId)}</p>
            <p className="mt-4 text-sm text-muted">
              {pickLocale(locale, site.instructorQualificationsEs, site.instructorQualificationsEn)}
            </p>
          </div>
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
