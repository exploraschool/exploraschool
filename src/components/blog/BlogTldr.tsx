import { BlogStarRating } from "@/components/blog/BlogStarRating";
import { pickLocale } from "@/lib/locale";

export function BlogTldr({
  locale,
  score,
  amazonScore,
  best,
  worst,
  forWhom,
}: {
  locale: string;
  score: number;
  amazonScore?: number;
  best: string;
  worst: string;
  forWhom: string;
}) {
  if (!best && !worst && !forWhom && !score && !amazonScore) return null;
  const showExplora = score > 0;
  const showAmazon = Boolean(amazonScore && amazonScore > 0);
  return (
    <aside className="overflow-hidden rounded-2xl border border-hielo/15 bg-white shadow-[0_12px_32px_rgb(45_107_100_/_0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hielo/10 bg-hielo/5 px-5 py-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-hielo">TL;DR</p>
          <p className="mt-1 font-display text-xl font-semibold text-pizarra">
            {pickLocale(locale, "La lectura rápida", "The short version")}
          </p>
        </div>
        {showExplora ? (
          <div className="text-right">
            <BlogStarRating score={score} />
            <p className="mt-1 text-sm font-semibold text-pizarra">
              {score.toFixed(1)}
              <span className="font-normal text-muted">
                {pickLocale(locale, " / 5 Explora", " / 5 Explora")}
              </span>
            </p>
          </div>
        ) : showAmazon ? (
          <div className="text-right">
            <BlogStarRating score={amazonScore ?? 0} />
            <p className="mt-1 text-xs font-medium text-muted">
              {pickLocale(locale, "Valoración en Amazon", "Amazon rating")} · {(amazonScore ?? 0).toFixed(1)} / 5
            </p>
          </div>
        ) : null}
      </div>
      <dl className="grid gap-0 sm:grid-cols-3">
        <div className="border-b border-hielo/8 px-5 py-4 sm:border-b-0 sm:border-r">
          <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-hielo">
            {pickLocale(locale, "Lo mejor", "Best")}
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-pizarra">{best || "—"}</dd>
        </div>
        <div className="border-b border-hielo/8 px-5 py-4 sm:border-b-0 sm:border-r">
          <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
            {pickLocale(locale, "Lo peor", "Worst")}
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-pizarra">{worst || "—"}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-hielo">
            {pickLocale(locale, "Para quién es ideal", "Best for")}
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-pizarra">{forWhom || "—"}</dd>
        </div>
      </dl>
    </aside>
  );
}
