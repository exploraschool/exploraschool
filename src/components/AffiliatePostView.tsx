import { Link } from "@/i18n/routing";
import Image from "next/image";
import type { AffiliateBlogPost } from "@/lib/affiliate-blog-shared";
import { pickLocale } from "@/lib/locale";

function AmazonCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgb(234_91_94_/_0.28)] transition hover:bg-accent-dark"
    >
      {label}
    </a>
  );
}

export function AffiliateDisclosure({ locale }: { locale: string }) {
  return (
    <p className="rounded-2xl border border-oro/25 bg-oro/10 px-4 py-3 text-sm leading-relaxed text-pizarra">
      {pickLocale(
        locale,
        "Como Afiliados de Amazon, obtenemos ingresos por las compras adscritas que cumplen los requisitos aplicables. Los precios y la disponibilidad pueden cambiar en Amazon.",
        "As an Amazon Associate, we earn from qualifying purchases. Prices and availability may change on Amazon.",
      )}
    </p>
  );
}

export function AffiliatePostView({
  post,
  locale,
}: {
  post: AffiliateBlogPost;
  locale: string;
}) {
  const winner = post.products[post.winnerIndex] ?? post.products[0];

  return (
    <div className="space-y-10">
      <AffiliateDisclosure locale={locale} />

      {post.coverImage ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={post.coverImage}
            alt={pickLocale(locale, post.coverAltEs, post.coverAltEn)}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      ) : null}

      <div className="space-y-4 text-muted leading-relaxed">
        {(pickLocale(locale, post.introEs, post.introEn) || "")
          .split("\n")
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>

      {post.type === "ranking" && post.methodologyEs ? (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, "Cómo hemos elegido", "How we chose")}
          </h2>
          <p className="mt-3 text-muted leading-relaxed">
            {pickLocale(locale, post.methodologyEs, post.methodologyEn)}
          </p>
        </section>
      ) : null}

      {post.type === "ranking" && post.comparison.length > 0 ? (
        <section className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hielo/15">
                <th className="py-2 pr-3 font-semibold"> </th>
                {post.products.map((product, index) => (
                  <th key={index} className="px-3 py-2 font-semibold text-hielo">
                    {index + 1}. {pickLocale(locale, product.nameEs, product.nameEn).slice(0, 28)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {post.comparison.map((row) => (
                <tr key={row.labelEs} className="border-b border-hielo/8">
                  <td className="py-2 pr-3 font-medium text-pizarra">
                    {pickLocale(locale, row.labelEs, row.labelEn)}
                  </td>
                  {post.products.map((_, index) => (
                    <td key={index} className="px-3 py-2 text-muted">
                      {row.values[index] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="space-y-6">
        {post.products.map((product, index) => {
          const isWinner = post.type === "ranking" && index === post.winnerIndex;
          return (
            <article
              key={`${product.asin}-${index}`}
              className={`overflow-hidden rounded-2xl border bg-white ${
                isWinner ? "border-hielo shadow-[0_12px_32px_rgb(45_107_100_/_0.12)]" : "border-hielo/10"
              }`}
            >
              <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                <div className="relative aspect-square bg-nieve sm:aspect-auto">
                  {product.imageSrc ? (
                    <Image
                      src={product.imageSrc}
                      alt={pickLocale(locale, product.altEs, product.altEn)}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, 220px"
                    />
                  ) : null}
                  {post.type === "ranking" ? (
                    <span className="absolute left-3 top-3 rounded-full bg-hielo px-2.5 py-1 text-xs font-bold text-white">
                      {isWinner
                        ? pickLocale(locale, "Nuestra elección", "Our pick")
                        : `#${index + 1}`}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="font-display text-xl font-semibold">
                    {pickLocale(locale, product.nameEs, product.nameEn)}
                  </h3>
                  {product.priceText ? (
                    <p className="text-sm font-semibold text-hielo">{product.priceText}</p>
                  ) : null}
                  <p className="text-sm leading-relaxed text-muted">
                    {pickLocale(locale, product.summaryEs, product.summaryEn)}
                  </p>
                  <p className="text-sm text-pizarra">
                    <span className="font-semibold">
                      {pickLocale(locale, "Para quién: ", "Best for: ")}
                    </span>
                    {pickLocale(locale, product.forWhomEs, product.forWhomEn)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ul className="space-y-1 text-sm text-hielo">
                      {(locale === "en" ? product.prosEn : product.prosEs).map((pro, i) => (
                        <li key={i}>+ {pro}</li>
                      ))}
                    </ul>
                    <ul className="space-y-1 text-sm text-muted">
                      {(locale === "en" ? product.consEn : product.consEs).map((con, i) => (
                        <li key={i}>− {con}</li>
                      ))}
                    </ul>
                  </div>
                  {product.affiliateUrl ? (
                    <AmazonCta
                      href={product.affiliateUrl}
                      label={pickLocale(locale, product.ctaLabelEs, product.ctaLabelEn)}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {winner && post.type === "ranking" ? (
        <p className="text-sm leading-relaxed text-muted">
          {pickLocale(
            locale,
            `Si solo vas a llevarte uno a Sierra Nevada, quédate con ${winner.nameEs}.`,
            `If you only buy one for Sierra Nevada, go with ${winner.nameEn}.`,
          )}
        </p>
      ) : null}

      {post.faq.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, "Preguntas frecuentes", "FAQ")}
          </h2>
          <div className="mt-4 space-y-4">
            {post.faq.map((item) => (
              <div key={item.qEs} className="rounded-2xl border border-hielo/10 bg-white p-4">
                <p className="font-semibold">{pickLocale(locale, item.qEs, item.qEn)}</p>
                <p className="mt-2 text-sm text-muted">{pickLocale(locale, item.aEs, item.aEn)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {post.internalLinks.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {post.internalLinks.map((item) => (
            <Link key={item.href} href={item.href} className="btn-secondary !w-auto">
              {pickLocale(locale, item.labelEs, item.labelEn)}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-hielo/10 pt-8">
        <Link href="/clases" className="btn-primary !w-auto">
          {pickLocale(locale, "Ver clases", "View lessons")}
        </Link>
        <Link href="/reserva" className="btn-secondary !w-auto">
          {pickLocale(locale, "Reservar", "Book now")}
        </Link>
      </div>
    </div>
  );
}
