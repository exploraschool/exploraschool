"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { AffiliateProductGallery } from "@/components/AffiliateProductGallery";
import {
  productGallery,
  type AffiliateBlogPost,
} from "@/lib/affiliate-blog-shared";
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

function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;
  return (
    <div className="space-y-4 text-[1.05rem] leading-relaxed text-muted">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
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
  const toc = [
    post.verdictEs ? { id: "veredicto", es: "Veredicto", en: "Verdict" } : null,
    { id: "guia", es: "La guía", en: "The guide" },
    post.howToChooseEs ? { id: "elegir", es: "Cómo elegir", en: "How to choose" } : null,
    post.type === "ranking" && post.comparison.length
      ? { id: "comparativa", es: "Comparativa", en: "Comparison" }
      : null,
    { id: "productos", es: post.type === "ranking" ? "Los 6 productos" : "El producto", en: post.type === "ranking" ? "The 6 products" : "The product" },
    post.faq.length ? { id: "faq", es: "Preguntas frecuentes", en: "FAQ" } : null,
  ].filter((item): item is { id: string; es: string; en: string } => Boolean(item));

  return (
    <div className="space-y-12">
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

      {pickLocale(locale, post.verdictEs, post.verdictEn) ? (
        <aside
          id="veredicto"
          className="rounded-2xl border border-hielo/20 bg-hielo/5 p-5 sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-hielo">
            {pickLocale(locale, "Veredicto Explora", "Explora verdict")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-pizarra">
            {winner ? pickLocale(locale, winner.nameEs, winner.nameEn) : ""}
          </p>
          <p className="mt-3 leading-relaxed text-muted">
            {pickLocale(locale, post.verdictEs, post.verdictEn)}
          </p>
          {winner?.affiliateUrl ? (
            <div className="mt-4">
              <AmazonCta
                href={winner.affiliateUrl}
                label={pickLocale(locale, winner.ctaLabelEs, winner.ctaLabelEn)}
              />
            </div>
          ) : null}
        </aside>
      ) : null}

      <nav aria-label={pickLocale(locale, "Índice", "Contents")} className="rounded-2xl border border-hielo/10 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-hielo">
          {pickLocale(locale, "En esta guía", "In this guide")}
        </p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {toc.map((item, index) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-pizarra hover:text-hielo">
                {index + 1}. {pickLocale(locale, item.es, item.en)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="guia" className="space-y-4">
        <Prose text={pickLocale(locale, post.introEs, post.introEn)} />
      </section>

      {pickLocale(locale, post.methodologyEs, post.methodologyEn) ? (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, "Cómo hemos elegido", "How we chose")}
          </h2>
          <div className="mt-3">
            <Prose text={pickLocale(locale, post.methodologyEs, post.methodologyEn)} />
          </div>
        </section>
      ) : null}

      {pickLocale(locale, post.howToChooseEs, post.howToChooseEn) ? (
        <section id="elegir">
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, "Cómo elegir el adecuado", "How to choose the right one")}
          </h2>
          <div className="mt-3">
            <Prose text={pickLocale(locale, post.howToChooseEs, post.howToChooseEn)} />
          </div>
        </section>
      ) : null}

      {post.sections.map((section) => (
        <section key={section.headingEs}>
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, section.headingEs, section.headingEn)}
          </h2>
          <div className="mt-3">
            <Prose text={pickLocale(locale, section.bodyEs, section.bodyEn)} />
          </div>
        </section>
      ))}

      {post.type === "ranking" && post.comparison.length > 0 ? (
        <section id="comparativa" className="overflow-x-auto">
          <h2 className="mb-3 font-display text-2xl font-semibold">
            {pickLocale(locale, "Comparativa rápida", "Quick comparison")}
          </h2>
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

      <section id="productos" className="space-y-10">
        {post.products.map((product, index) => {
          const isWinner = post.type === "ranking" && index === post.winnerIndex;
          const gallery = productGallery(product);
          const rating = product.rating;
          const reviews = product.reviewCount;
          return (
            <article
              key={`${product.asin || product.nameEs}-${index}`}
              id={`producto-${index + 1}`}
              className={`overflow-hidden rounded-2xl border bg-white ${
                isWinner ? "border-hielo shadow-[0_12px_32px_rgb(45_107_100_/_0.12)]" : "border-hielo/10"
              }`}
            >
              <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                <div className="p-4">
                  <AffiliateProductGallery
                    images={gallery}
                    locale={locale}
                    badge={
                      post.type === "ranking"
                        ? isWinner
                          ? pickLocale(locale, "Nuestra elección", "Our pick")
                          : `#${index + 1}`
                        : undefined
                    }
                  />
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  {product.brand ? (
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-hielo">
                      {product.brand}
                    </p>
                  ) : null}
                  <h3 className="font-display text-2xl font-semibold">
                    {pickLocale(locale, product.nameEs, product.nameEn)}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {product.priceText ? (
                      <span className="font-semibold text-hielo">{product.priceText}</span>
                    ) : null}
                    {rating ? <span className="text-muted">{rating}</span> : null}
                    {reviews ? <span className="text-muted">{reviews}</span> : null}
                  </div>
                  <p className="text-[1.02rem] leading-relaxed text-pizarra">
                    {pickLocale(locale, product.summaryEs, product.summaryEn)}
                  </p>
                  <Prose text={pickLocale(locale, product.bodyEs, product.bodyEn)} />
                  {pickLocale(locale, product.onSnowEs, product.onSnowEn) ? (
                    <div className="rounded-xl bg-nieve px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-hielo">
                        {pickLocale(locale, "En Sierra Nevada", "On Sierra Nevada snow")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {pickLocale(locale, product.onSnowEs, product.onSnowEn)}
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm text-pizarra">
                    <span className="font-semibold">
                      {pickLocale(locale, "Para quién: ", "Best for: ")}
                    </span>
                    {pickLocale(locale, product.forWhomEs, product.forWhomEn)}
                  </p>
                  {pickLocale(locale, product.skipIfEs, product.skipIfEn) ? (
                    <p className="text-sm text-muted">
                      <span className="font-semibold text-pizarra">
                        {pickLocale(locale, "Pásalo si: ", "Skip if: ")}
                      </span>
                      {pickLocale(locale, product.skipIfEs, product.skipIfEn)}
                    </p>
                  ) : null}
                  {product.specs.length > 0 ? (
                    <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                      {product.specs.map((spec) => (
                        <div key={spec.labelEs} className="rounded-lg bg-nieve px-3 py-2">
                          <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-hielo">
                            {pickLocale(locale, spec.labelEs, spec.labelEn)}
                          </dt>
                          <dd className="mt-0.5 text-pizarra">
                            {pickLocale(locale, spec.valueEs, spec.valueEn)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
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
        <section id="faq">
          <h2 className="font-display text-2xl font-semibold">
            {pickLocale(locale, "Preguntas frecuentes", "FAQ")}
          </h2>
          <div className="mt-4 space-y-4">
            {post.faq.map((item) => (
              <div key={item.qEs} className="rounded-2xl border border-hielo/10 bg-white p-4">
                <p className="font-semibold">{pickLocale(locale, item.qEs, item.qEn)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {pickLocale(locale, item.aEs, item.aEn)}
                </p>
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
