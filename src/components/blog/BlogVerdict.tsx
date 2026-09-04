import { pickLocale } from "@/lib/locale";
import { BlogStarRating } from "@/components/blog/BlogStarRating";

export function BlogVerdict({
  locale,
  productName,
  text,
  score,
}: {
  locale: string;
  productName?: string;
  text: string;
  score?: number;
}) {
  if (!text) return null;
  return (
    <aside
      id="veredicto"
      className="scroll-mt-28 rounded-2xl border border-hielo/15 bg-hielo/[0.06] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-hielo">
          {pickLocale(locale, "Veredicto Explora", "Explora verdict")}
        </p>
        {score && score > 0 ? (
          <div className="text-right">
            <BlogStarRating score={score} size="sm" />
            <p className="mt-1 text-xs font-semibold text-pizarra">
              {score.toFixed(1)}
              <span className="font-normal text-muted"> / 5 Explora</span>
            </p>
          </div>
        ) : null}
      </div>
      {productName ? (
        <p className="mt-2 font-display text-2xl font-bold text-pizarra">{productName}</p>
      ) : null}
      <p className="mt-3 max-w-prose text-[1.05rem] leading-relaxed text-pizarra/90">{text}</p>
    </aside>
  );
}
