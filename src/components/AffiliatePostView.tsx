"use client";

import Image from "next/image";
import Link from "next/link";
import { AffiliateProductGallery } from "@/components/AffiliateProductGallery";
import { BlogAlternatives, type BlogAlternativeItem } from "@/components/blog/BlogAlternatives";
import { BlogAmazonCta } from "@/components/blog/BlogAmazonCta";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogLessonCta } from "@/components/blog/BlogLessonCta";
import { BlogProsCons } from "@/components/blog/BlogProsCons";
import { BlogComparisonTable, BlogTechTable } from "@/components/blog/BlogTechTable";
import { BlogTldr } from "@/components/blog/BlogTldr";
import { BlogToc } from "@/components/blog/BlogToc";
import { BlogVerdict } from "@/components/blog/BlogVerdict";
import { BlogRankingNav, BlogRankingWinner, rankingPickBadge } from "@/components/blog/BlogRankingPicks";
import { BlogStarRating } from "@/components/blog/BlogStarRating";
import {
  productGallery,
  type AffiliateAlternative,
  type AffiliateBlogPost,
  type AffiliateProduct,
} from "@/lib/affiliate-blog-shared";
import {
  BLOG_H2_CLASS,
  BLOG_P_CLASS,
  inferBlogDiscipline,
  localizedHref,
  parseExploraScore,
  headingIdFor,
  type BlogDisciplineCta,
  type BlogTocItem,
} from "@/lib/blog-article";
import { pickLocale } from "@/lib/locale";

function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;
  return (
    <div>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={BLOG_P_CLASS}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function amazonLabel(locale: string, es: string, en: string): string {
  const generic = /^(ver en amazon|see on amazon|comprar en amazon|buy on amazon)$/i;
  const fallback = pickLocale(
    locale,
    "Comprobar talla y precio en Amazon",
    "Check size and price on Amazon",
  );
  const label = pickLocale(locale, es, en);
  return !label || generic.test(label) ? fallback : label;
}

function amazonMeta(product: AffiliateProduct, locale: string): string {
  return [product.brand, product.priceText]
    .filter(Boolean)
    .join(" · ") || pickLocale(locale, "Precio en Amazon", "Price on Amazon");
}

function amazonNote(locale: string): string {
  return pickLocale(
    locale,
    "Enlace de afiliado. El precio y la talla se confirman en Amazon.",
    "Affiliate link. Size and price are confirmed on Amazon.",
  );
}

function ReviewAmazonCta({
  product,
  locale,
}: {
  product?: AffiliateProduct;
  locale: string;
}) {
  if (!product?.affiliateUrl) return null;
  return (
    <BlogAmazonCta
      href={product.affiliateUrl}
      title={pickLocale(locale, product.nameEs, product.nameEn)}
      meta={amazonMeta(product, locale)}
      label={amazonLabel(locale, product.ctaLabelEs, product.ctaLabelEn)}
      note={amazonNote(locale)}
    />
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

function FaqBlock({
  locale,
  faq,
}: {
  locale: string;
  faq: AffiliateBlogPost["faq"];
}) {
  if (!faq.length) return null;
  return (
    <section id="faq" className="scroll-mt-28">
      <h2 className={BLOG_H2_CLASS}>
        {pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
      </h2>
      <div className="mt-2 space-y-3">
        {faq.map((item) => (
          <details
            key={item.qEs}
            className="group rounded-2xl border border-hielo/12 bg-white px-5 py-4"
          >
            <summary className="cursor-pointer list-none font-semibold text-pizarra marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                {pickLocale(locale, item.qEs, item.qEn)}
                <span className="mt-0.5 text-hielo transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 max-w-prose text-[1.02rem] leading-relaxed text-muted">
              {pickLocale(locale, item.aEs, item.aEn)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function fallbackAlternatives(
  locale: string,
  product: AffiliateProduct | undefined,
  discipline: BlogDisciplineCta,
  stored: AffiliateAlternative[],
): BlogAlternativeItem[] {
  if (stored.length) {
    return stored.map((item) => ({
      title: pickLocale(locale, item.titleEs, item.titleEn),
      why: pickLocale(locale, item.whyEs, item.whyEn),
      href: item.href,
    }));
  }
  const skipIf = pickLocale(locale, product?.skipIfEs || "", product?.skipIfEn || "");
  const items: BlogAlternativeItem[] = [];
  if (skipIf) {
    items.push({
      title: pickLocale(locale, "Pásalo si no encaja contigo", "Skip it if it isn’t for you"),
      why: skipIf,
      href: discipline.href,
    });
  }
  items.push({
    title: pickLocale(locale, `Clase de ${discipline.nameEs.toLowerCase()}`, `${discipline.nameEn} lesson`),
    why: pickLocale(locale, discipline.blurbEs, discipline.blurbEn),
    href: discipline.href,
  });
  items.push({
    title: pickLocale(locale, "Alquilar el primer día", "Rent on your first day"),
    why: pickLocale(
      locale,
      "Si aún no estás seguro de talla o modelo, alquila en Sierra Nevada y decide después de una clase.",
      "If you are still unsure about size or model, rent in Sierra Nevada and decide after a lesson.",
    ),
    href: "/reserva",
  });
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  }).slice(0, 3);
}

function Cover({ post, locale }: { post: AffiliateBlogPost; locale: string }) {
  if (!post.coverImage) return null;
  return (
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
  );
}

function ReviewProduct({
  product,
  locale,
  instructorNote,
}: {
  product: AffiliateProduct;
  locale: string;
  instructorNote: string;
}) {
  const gallery = productGallery(product);
  const amazonScore = parseExploraScore(product.rating);
  const onSnow = pickLocale(locale, product.onSnowEs, product.onSnowEn);
  return (
    <section id="producto" className="scroll-mt-28 space-y-6">
      <h2 className={BLOG_H2_CLASS}>
        {pickLocale(locale, product.nameEs, product.nameEn) ||
          pickLocale(locale, "El producto", "The product")}
      </h2>
      <AffiliateProductGallery
        images={gallery}
        locale={locale}
        badge={pickLocale(locale, "Análisis Explora", "Explora review")}
      />
      {product.brand ? (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-hielo">{product.brand}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {product.priceText ? <span className="font-semibold text-hielo">{product.priceText}</span> : null}
        {amazonScore > 0 ? (
          <span className="inline-flex items-center gap-2 text-muted">
            <BlogStarRating score={amazonScore} size="sm" />
            <span>
              {pickLocale(locale, "Amazon", "Amazon")} {amazonScore.toFixed(1)}
              {product.reviewCount ? ` · ${product.reviewCount}` : ""}
            </span>
          </span>
        ) : product.reviewCount ? (
          <span className="text-muted">{product.reviewCount}</span>
        ) : null}
      </div>
      {pickLocale(locale, product.summaryEs, product.summaryEn) ? (
        <p className="max-w-prose text-[1.05rem] font-medium leading-relaxed text-pizarra">
          {pickLocale(locale, product.summaryEs, product.summaryEn)}
        </p>
      ) : null}
      <ReviewAmazonCta product={product} locale={locale} />
      <Prose text={pickLocale(locale, product.bodyEs, product.bodyEn)} />
      {onSnow && onSnow !== instructorNote ? (
        <BlogCallout locale={locale} title={pickLocale(locale, "En Sierra Nevada", "On Sierra Nevada snow")}>
          <p>{onSnow}</p>
        </BlogCallout>
      ) : null}
      <BlogProsCons
        locale={locale}
        pros={locale === "en" ? product.prosEn ?? [] : product.prosEs ?? []}
        cons={locale === "en" ? product.consEn ?? [] : product.consEs ?? []}
      />
      <BlogTechTable
        rows={(product.specs ?? []).map((spec) => ({
          label: pickLocale(locale, spec.labelEs, spec.labelEn),
          value: pickLocale(locale, spec.valueEs, spec.valueEn),
        }))}
      />
      <ReviewAmazonCta product={product} locale={locale} />
    </section>
  );
}

function ReviewArticle({
  post,
  locale,
}: {
  post: AffiliateBlogPost;
  locale: string;
}) {
  const product = post.products[0];
  const exploraScore = parseExploraScore(post.score);
  const amazonScore = parseExploraScore(product?.rating);
  const best =
    pickLocale(locale, post.tldrBestEs, post.tldrBestEn) ||
    (locale === "en" ? product?.prosEn?.[0] : product?.prosEs?.[0]) ||
    "";
  const worst =
    pickLocale(locale, post.tldrWorstEs, post.tldrWorstEn) ||
    (locale === "en" ? product?.consEn?.[0] : product?.consEs?.[0]) ||
    "";
  const forWhom = pickLocale(locale, product?.forWhomEs || "", product?.forWhomEn || "");
  const instructorNote =
    pickLocale(locale, post.instructorNoteEs, post.instructorNoteEn) ||
    pickLocale(locale, product?.onSnowEs || "", product?.onSnowEn || "");
  const verdict = pickLocale(locale, post.verdictEs, post.verdictEn);
  const discipline = inferBlogDiscipline(
    [
      post.slug,
      post.titleEs,
      post.titleEn,
      ...(post.internalLinks ?? []).map((item) => item.href),
      `${product?.nameEs ?? ""} ${product?.nameEn ?? ""}`,
    ].join(" "),
  );
  const alternatives = fallbackAlternatives(locale, product, discipline, post.alternatives ?? []);
  const sections = post.sections ?? [];
  const sectionSeen = new Map<string, number>();
  const sectionIds = sections.map((section) =>
    headingIdFor(pickLocale(locale, section.headingEs, section.headingEn), sectionSeen),
  );

  const toc: BlogTocItem[] = [
    product?.affiliateUrl
      ? { id: "eleccion", label: pickLocale(locale, "Nuestra elección", "Our pick") }
      : null,
    verdict || product?.affiliateUrl
      ? { id: "veredicto", label: pickLocale(locale, "Veredicto", "Verdict") }
      : null,
    pickLocale(locale, post.introEs, post.introEn)
      ? { id: "guia", label: pickLocale(locale, "La review", "The review") }
      : null,
    instructorNote
      ? { id: "consejo", label: pickLocale(locale, "Consejo del instructor", "Instructor note") }
      : null,
    product ? { id: "producto", label: pickLocale(locale, "El producto", "The product") } : null,
    pickLocale(locale, post.methodologyEs, post.methodologyEn)
      ? { id: "metodo", label: pickLocale(locale, "Cómo lo hemos visto", "How we assessed it") }
      : null,
    ...sections.map((section, index) => ({
      id: sectionIds[index],
      label: pickLocale(locale, section.headingEs, section.headingEn),
    })),
    alternatives.length
      ? { id: "alternativas", label: pickLocale(locale, "Si este no encaja", "If this isn’t the one") }
      : null,
    post.faq.length ? { id: "faq", label: pickLocale(locale, "Preguntas frecuentes", "FAQ") } : null,
    { id: "clases", label: pickLocale(locale, "Clases en Sierra Nevada", "Lessons in Sierra Nevada") },
  ].filter((item): item is BlogTocItem => Boolean(item));

  return (
    <div className="space-y-10 sm:space-y-12">
      <Cover post={post} locale={locale} />
      <BlogTldr
        locale={locale}
        score={exploraScore}
        amazonScore={amazonScore}
        best={best}
        worst={worst}
        forWhom={forWhom}
      />

      {product?.affiliateUrl ? (
        <div id="eleccion" className="scroll-mt-28">
          <BlogRankingWinner
            locale={locale}
            product={product}
            index={0}
            eyebrow={pickLocale(locale, "Nuestra elección", "Our pick")}
            cta={{
              href: product.affiliateUrl,
              label: amazonLabel(locale, product.ctaLabelEs, product.ctaLabelEn),
            }}
            secondaryHref="#producto"
            secondaryLabel={pickLocale(locale, "Ver el análisis", "Read the review")}
          />
        </div>
      ) : null}

      <BlogVerdict
        locale={locale}
        productName={product ? pickLocale(locale, product.nameEs, product.nameEn) : ""}
        text={verdict}
        score={exploraScore}
        cta={
          product?.affiliateUrl
            ? {
                href: product.affiliateUrl,
                label: amazonLabel(locale, product.ctaLabelEs, product.ctaLabelEn),
              }
            : null
        }
      />
      <BlogToc items={toc} locale={locale} />

      {pickLocale(locale, post.introEs, post.introEn) ? (
        <section id="guia" className="scroll-mt-28">
          <Prose text={pickLocale(locale, post.introEs, post.introEn)} />
        </section>
      ) : null}

      {instructorNote ? (
        <div id="consejo" className="scroll-mt-28">
          <BlogCallout locale={locale}>
            <p>{instructorNote}</p>
          </BlogCallout>
        </div>
      ) : null}

      {product ? <ReviewProduct product={product} locale={locale} instructorNote={instructorNote} /> : null}

      {pickLocale(locale, post.methodologyEs, post.methodologyEn) ? (
        <section id="metodo" className="scroll-mt-28">
          <h2 className={BLOG_H2_CLASS}>
            {pickLocale(locale, "Cómo lo hemos visto", "How we assessed it")}
          </h2>
          <Prose text={pickLocale(locale, post.methodologyEs, post.methodologyEn)} />
        </section>
      ) : null}

      {sections.map((section, index) => (
        <section key={section.headingEs} id={sectionIds[index]} className="scroll-mt-28">
          <h2 className={BLOG_H2_CLASS}>{pickLocale(locale, section.headingEs, section.headingEn)}</h2>
          <Prose text={pickLocale(locale, section.bodyEs, section.bodyEn)} />
        </section>
      ))}

      <BlogAlternatives locale={locale} items={alternatives} />
      <FaqBlock locale={locale} faq={post.faq ?? []} />
      <ReviewAmazonCta product={product} locale={locale} />

      {(post.internalLinks ?? []).length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {post.internalLinks.map((item) => (
            <Link key={item.href} href={localizedHref(locale, item.href)} className="btn-secondary !w-auto">
              {pickLocale(locale, item.labelEs, item.labelEn)}
            </Link>
          ))}
        </div>
      ) : null}

      <div id="clases" className="scroll-mt-28">
        <BlogLessonCta locale={locale} discipline={discipline} />
      </div>
      <AffiliateDisclosure locale={locale} />
    </div>
  );
}

function RankingArticle({
  post,
  locale,
}: {
  post: AffiliateBlogPost;
  locale: string;
}) {
  const products = post.products ?? [];
  const sections = post.sections ?? [];
  const faq = post.faq ?? [];
  const internalLinks = post.internalLinks ?? [];
  const comparison = post.comparison ?? [];
  const winner = products[post.winnerIndex] ?? products[0];
  const runnerUp = products.find((_, index) => index !== post.winnerIndex);
  const exploraScore = parseExploraScore(post.score);
  const amazonScore = parseExploraScore(winner?.rating);
  const best =
    pickLocale(locale, post.tldrBestEs, post.tldrBestEn) ||
    (locale === "en" ? winner?.prosEn?.[0] : winner?.prosEs?.[0]) ||
    "";
  const worst =
    pickLocale(locale, post.tldrWorstEs, post.tldrWorstEn) ||
    (locale === "en" ? winner?.consEn?.[0] : winner?.consEs?.[0]) ||
    "";
  const forWhom = pickLocale(locale, winner?.forWhomEs || "", winner?.forWhomEn || "");
  const instructorNote =
    pickLocale(locale, post.instructorNoteEs, post.instructorNoteEn) ||
    pickLocale(locale, winner?.onSnowEs || "", winner?.onSnowEn || "");
  const verdict = pickLocale(locale, post.verdictEs, post.verdictEn);
  const discipline = inferBlogDiscipline(
    [
      post.slug,
      post.titleEs,
      post.titleEn,
      ...internalLinks.map((item) => item.href),
      ...products.map((product) => `${product.nameEs} ${product.nameEn}`),
    ].join(" "),
  );
  const sectionSeen = new Map<string, number>();
  const sectionIds = sections.map((section) =>
    headingIdFor(pickLocale(locale, section.headingEs, section.headingEn), sectionSeen),
  );

  const toc: BlogTocItem[] = [
    winner ? { id: "eleccion", label: pickLocale(locale, "Nuestra elección", "Our pick") } : null,
    verdict ? { id: "veredicto", label: pickLocale(locale, "Veredicto", "Verdict") } : null,
    pickLocale(locale, post.introEs, post.introEn)
      ? { id: "guia", label: pickLocale(locale, "La guía", "The guide") }
      : null,
    comparison.length ? { id: "comparativa", label: pickLocale(locale, "Comparativa", "Comparison") } : null,
    pickLocale(locale, post.howToChooseEs, post.howToChooseEn)
      ? { id: "elegir", label: pickLocale(locale, "Cómo elegir", "How to choose") }
      : null,
    instructorNote
      ? { id: "consejo", label: pickLocale(locale, "Consejo del instructor", "Instructor note") }
      : null,
    pickLocale(locale, post.methodologyEs, post.methodologyEn)
      ? { id: "metodo", label: pickLocale(locale, "Cómo lo hemos elegido", "How we chose") }
      : null,
    ...sections.map((section, index) => ({
      id: sectionIds[index],
      label: pickLocale(locale, section.headingEs, section.headingEn),
    })),
    { id: "los-productos", label: pickLocale(locale, "Los 6 productos", "The 6 products") },
    faq.length ? { id: "faq", label: pickLocale(locale, "Preguntas frecuentes", "FAQ") } : null,
    { id: "clases", label: pickLocale(locale, "Clases en Sierra Nevada", "Lessons in Sierra Nevada") },
  ].filter((item): item is BlogTocItem => Boolean(item));

  return (
    <div className="space-y-10 sm:space-y-12">
      <Cover post={post} locale={locale} />
      <BlogTldr
        locale={locale}
        score={exploraScore}
        amazonScore={amazonScore}
        best={best}
        worst={worst}
        forWhom={forWhom}
      />

      {winner ? (
        <div id="eleccion" className="scroll-mt-28">
          <BlogRankingWinner
            locale={locale}
            product={winner}
            index={post.winnerIndex}
            cta={{
              href: winner.affiliateUrl,
              label: amazonLabel(locale, winner.ctaLabelEs, winner.ctaLabelEn),
            }}
          />
        </div>
      ) : null}

      <BlogVerdict
        locale={locale}
        productName={winner ? pickLocale(locale, winner.nameEs, winner.nameEn) : ""}
        text={verdict}
        score={exploraScore}
      />
      <BlogToc items={toc} locale={locale} />

      {pickLocale(locale, post.introEs, post.introEn) ? (
        <section id="guia" className="scroll-mt-28">
          <Prose text={pickLocale(locale, post.introEs, post.introEn)} />
        </section>
      ) : null}

      {comparison.length > 0 ? (
        <section id="comparativa" className="scroll-mt-28 space-y-5">
          <h2 className={BLOG_H2_CLASS}>
            {pickLocale(locale, "Comparativa rápida", "Quick comparison")}
          </h2>
          <BlogComparisonTable
            winnerIndex={post.winnerIndex}
            columns={products.map((product) =>
              pickLocale(locale, product.nameEs, product.nameEn).slice(0, 28),
            )}
            rows={comparison.map((row) => ({
              label: pickLocale(locale, row.labelEs, row.labelEn),
              values: row.values,
            }))}
          />
          <BlogRankingNav locale={locale} products={products} winnerIndex={post.winnerIndex} />
        </section>
      ) : (
        <BlogRankingNav locale={locale} products={products} winnerIndex={post.winnerIndex} />
      )}

      {pickLocale(locale, post.howToChooseEs, post.howToChooseEn) ? (
        <section id="elegir" className="scroll-mt-28">
          <h2 className={BLOG_H2_CLASS}>
            {pickLocale(locale, "Cómo elegir el adecuado", "How to choose the right one")}
          </h2>
          <Prose text={pickLocale(locale, post.howToChooseEs, post.howToChooseEn)} />
        </section>
      ) : null}

      {instructorNote ? (
        <div id="consejo" className="scroll-mt-28">
          <BlogCallout locale={locale}>
            <p>{instructorNote}</p>
          </BlogCallout>
        </div>
      ) : null}

      {pickLocale(locale, post.methodologyEs, post.methodologyEn) ? (
        <section id="metodo" className="scroll-mt-28">
          <h2 className={BLOG_H2_CLASS}>
            {pickLocale(locale, "Cómo lo hemos elegido", "How we chose")}
          </h2>
          <Prose text={pickLocale(locale, post.methodologyEs, post.methodologyEn)} />
        </section>
      ) : null}

      {sections.map((section, index) => (
        <section key={section.headingEs} id={sectionIds[index]} className="scroll-mt-28">
          <h2 className={BLOG_H2_CLASS}>{pickLocale(locale, section.headingEs, section.headingEn)}</h2>
          <Prose text={pickLocale(locale, section.bodyEs, section.bodyEn)} />
        </section>
      ))}

      <section id="los-productos" className="scroll-mt-28 space-y-10">
        <h2 className={BLOG_H2_CLASS}>
          {pickLocale(locale, "Los 6 productos, uno a uno", "The 6 products, one by one")}
        </h2>
        {products.map((product, index) => {
          const isWinner = index === post.winnerIndex;
          const gallery = productGallery(product);
          const productAmazon = parseExploraScore(product.rating);
          const onSnow = pickLocale(locale, product.onSnowEs, product.onSnowEn);
          return (
            <article
              key={`${product.asin || product.nameEs}-${index}`}
              id={`producto-${index + 1}`}
              className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white ${
                isWinner
                  ? "border-hielo shadow-[0_12px_32px_rgb(45_107_100_/_0.12)]"
                  : "border-hielo/10"
              }`}
            >
              <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                <div className="p-4">
                  <AffiliateProductGallery
                    images={gallery}
                    locale={locale}
                    badge={rankingPickBadge(locale, product, index, post.winnerIndex)}
                  />
                </div>
                <div className="space-y-5 p-5 sm:p-6">
                  {product.brand ? (
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-hielo">{product.brand}</p>
                  ) : null}
                  <h3 className="font-display text-2xl font-bold tracking-tight text-pizarra sm:text-[1.65rem]">
                    {pickLocale(locale, product.nameEs, product.nameEn)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {product.priceText ? (
                      <span className="font-semibold text-hielo">{product.priceText}</span>
                    ) : null}
                    {productAmazon > 0 ? (
                      <span className="inline-flex items-center gap-2 text-muted">
                        <BlogStarRating score={productAmazon} size="sm" />
                        <span>
                          {pickLocale(locale, "Amazon", "Amazon")} {productAmazon.toFixed(1)}
                          {product.reviewCount ? ` · ${product.reviewCount}` : ""}
                        </span>
                      </span>
                    ) : null}
                  </div>
                  {pickLocale(locale, product.forWhomEs, product.forWhomEn) ? (
                    <p className="max-w-prose text-sm leading-relaxed text-pizarra">
                      <span className="font-semibold">
                        {pickLocale(locale, "Para quién: ", "Best for: ")}
                      </span>
                      {pickLocale(locale, product.forWhomEs, product.forWhomEn)}
                    </p>
                  ) : null}
                  {pickLocale(locale, product.summaryEs, product.summaryEn) ? (
                    <p className="max-w-prose text-[1.05rem] font-medium leading-relaxed text-pizarra">
                      {pickLocale(locale, product.summaryEs, product.summaryEn)}
                    </p>
                  ) : null}
                  <Prose text={pickLocale(locale, product.bodyEs, product.bodyEn)} />
                  {onSnow && onSnow !== instructorNote ? (
                    <BlogCallout
                      locale={locale}
                      title={pickLocale(locale, "En Sierra Nevada", "On Sierra Nevada snow")}
                    >
                      <p>{onSnow}</p>
                    </BlogCallout>
                  ) : null}
                  {pickLocale(locale, product.skipIfEs, product.skipIfEn) ? (
                    <p className="max-w-prose text-sm leading-relaxed text-muted">
                      <span className="font-semibold text-pizarra">
                        {pickLocale(locale, "Pásalo si: ", "Skip if: ")}
                      </span>
                      {pickLocale(locale, product.skipIfEs, product.skipIfEn)}
                    </p>
                  ) : null}
                  <BlogProsCons
                    locale={locale}
                    pros={locale === "en" ? product.prosEn ?? [] : product.prosEs ?? []}
                    cons={locale === "en" ? product.consEn ?? [] : product.consEs ?? []}
                  />
                  <BlogTechTable
                    rows={(product.specs ?? []).map((spec) => ({
                      label: pickLocale(locale, spec.labelEs, spec.labelEn),
                      value: pickLocale(locale, spec.valueEs, spec.valueEn),
                    }))}
                  />
                  {product.affiliateUrl ? (
                    <BlogAmazonCta
                      href={product.affiliateUrl}
                      title={pickLocale(locale, product.nameEs, product.nameEn)}
                      meta={amazonMeta(product, locale)}
                      label={amazonLabel(locale, product.ctaLabelEs, product.ctaLabelEn)}
                      note={amazonNote(locale)}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {winner ? (
        <p className={`${BLOG_P_CLASS} text-muted`}>
          {pickLocale(
            locale,
            runnerUp
              ? `Si solo vas a llevarte uno a Sierra Nevada, quédate con ${winner.nameEs}. Si no encaja, el siguiente que miraríamos es ${runnerUp.nameEs}.`
              : `Si solo vas a llevarte uno a Sierra Nevada, quédate con ${winner.nameEs}.`,
            runnerUp
              ? `If you only buy one for Sierra Nevada, go with ${winner.nameEn}. If that is not a fit, we would look at ${runnerUp.nameEn} next.`
              : `If you only buy one for Sierra Nevada, go with ${winner.nameEn}.`,
          )}
        </p>
      ) : null}

      <FaqBlock locale={locale} faq={faq} />

      {internalLinks.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {internalLinks.map((item) => (
            <Link key={item.href} href={localizedHref(locale, item.href)} className="btn-secondary !w-auto">
              {pickLocale(locale, item.labelEs, item.labelEn)}
            </Link>
          ))}
        </div>
      ) : null}

      <div id="clases" className="scroll-mt-28">
        <BlogLessonCta locale={locale} discipline={discipline} />
      </div>
      <AffiliateDisclosure locale={locale} />
    </div>
  );
}

export function AffiliatePostView({
  post,
  locale,
}: {
  post: AffiliateBlogPost;
  locale: string;
}) {
  if (post.type === "review") {
    return <ReviewArticle post={post} locale={locale} />;
  }
  return <RankingArticle post={post} locale={locale} />;
}
