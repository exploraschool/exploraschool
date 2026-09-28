import { getProductBySlug } from "@/data/products";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { productOfferSummary } from "@/lib/product-landing-copy";
import { getProductOfferRange } from "@/lib/product-offer";
import { EARLY_BIRD_DEADLINE, SEASON_DISCOUNT_DEADLINE } from "@/lib/promotions";
import { productPath, publicUrl, type IndexableProductId } from "@/lib/seo-urls";
import { getSiteUrl } from "@/lib/site-url";

type ProductJsonLdProps = {
  locale: string;
  productId: IndexableProductId;
};

function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function priceValidUntil(productId: IndexableProductId): string {
  if (productId === "curso-snow") return localIsoDate(SEASON_DISCOUNT_DEADLINE);
  return localIsoDate(new Date(EARLY_BIRD_DEADLINE.getTime() - 1));
}

export function ProductJsonLd({ locale, productId }: ProductJsonLdProps) {
  const product = getProductBySlug(productId);
  const path = productPath(productId);
  const range = getProductOfferRange(productId);
  if (!product || !path || !range) return null;

  const url = publicUrl(locale, path);
  const imagePath = product.image.startsWith("http") ? product.image : `${getSiteUrl()}${product.image}`;
  const name = pickLocale(locale, product.titleEs, product.titleEn);

  const offers: Record<string, unknown> = {
    "@type": "AggregateOffer",
    lowPrice: range.lowPrice,
    highPrice: range.highPrice,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url,
  };

  if (range.discountActive) {
    offers.priceValidUntil = priceValidUntil(productId);
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: productOfferSummary(locale, productId),
    image: imagePath,
    sku: product.id,
    url,
    brand: {
      "@type": "Brand",
      name: site.name,
    },
    offers,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
