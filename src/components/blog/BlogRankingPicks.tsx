import Image from "next/image";
import { primaryProductImage, type AffiliateProduct } from "@/lib/affiliate-blog-shared";
import { pickLocale } from "@/lib/locale";

export function rankingPickBadge(
  locale: string,
  product: AffiliateProduct,
  index: number,
  winnerIndex: number,
): string {
  const role = pickLocale(locale, product.pickRoleEs, product.pickRoleEn);
  if (role) return role;
  if (index === winnerIndex) return pickLocale(locale, "Nuestra elección", "Our pick");
  return `#${index + 1}`;
}

export function BlogRankingWinner({
  locale,
  product,
  index,
  cta,
}: {
  locale: string;
  product: AffiliateProduct;
  index: number;
  cta: { href: string; label: string };
}) {
  const image = primaryProductImage(product);
  const name = pickLocale(locale, product.nameEs, product.nameEn);
  return (
    <aside className="overflow-hidden rounded-2xl border border-hielo/20 bg-white shadow-[0_12px_32px_rgb(45_107_100_/_0.1)]">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <div className="relative min-h-44 bg-nieve sm:min-h-full">
          {image ? (
            <Image src={image} alt={name} fill className="object-contain p-6" sizes="220px" />
          ) : null}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-hielo">
            {pickLocale(locale, "Si solo te llevas uno", "If you only buy one")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-pizarra">{name}</h2>
          {product.priceText ? (
            <p className="mt-1 text-sm font-semibold text-hielo">{product.priceText}</p>
          ) : null}
          {pickLocale(locale, product.summaryEs, product.summaryEn) ? (
            <p className="mt-3 max-w-prose text-[1.02rem] leading-relaxed text-muted">
              {pickLocale(locale, product.summaryEs, product.summaryEn)}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {cta.href ? (
              <a
                href={cta.href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-hielo/20 bg-white px-5 py-2.5 text-sm font-semibold text-hielo shadow-[0_6px_16px_rgb(45_107_100_/_0.08)] transition hover:border-hielo hover:bg-hielo hover:text-white"
              >
                {cta.label}
              </a>
            ) : null}
            <a href={`#producto-${index + 1}`} className="btn-secondary !w-auto">
              {pickLocale(locale, "Ver por qué gana", "See why it wins")}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function BlogRankingNav({
  locale,
  products,
  winnerIndex,
}: {
  locale: string;
  products: AffiliateProduct[];
  winnerIndex: number;
}) {
  if (products.length < 2) return null;
  return (
    <nav aria-label={pickLocale(locale, "Los 6 del ranking", "The 6 in this ranking")} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => {
        const image = primaryProductImage(product);
        const name = pickLocale(locale, product.nameEs, product.nameEn);
        const isWinner = index === winnerIndex;
        return (
          <a
            key={`${product.asin || name}-${index}`}
            href={`#producto-${index + 1}`}
            className={`group flex gap-3 rounded-2xl border p-3 transition hover:border-hielo/40 ${
              isWinner ? "border-hielo bg-hielo/[0.05]" : "border-hielo/10 bg-white"
            }`}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-nieve">
              {image ? (
                <Image src={image} alt="" fill className="object-contain p-1.5" sizes="64px" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-hielo">
                {rankingPickBadge(locale, product, index, winnerIndex)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-pizarra group-hover:text-hielo">
                {name}
              </p>
              {product.priceText ? <p className="mt-1 text-xs text-muted">{product.priceText}</p> : null}
            </div>
          </a>
        );
      })}
    </nav>
  );
}
