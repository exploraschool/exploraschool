import { pickLocale } from "@/lib/locale";
import { BlogStarRating } from "@/components/blog/BlogStarRating";

export function BlogVerdict({
  locale,
  productName,
  text,
  score,
  cta,
}: {
  locale: string;
  productName?: string;
  text: string;
  score?: number;
  cta?: { href: string; label: string } | null;
}) {
  if (!text && !cta?.href) return null;
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
      {text ? (
        <p className="mt-3 max-w-prose text-[1.05rem] leading-relaxed text-pizarra/90">{text}</p>
      ) : null}
      {cta?.href ? (
        <a
          href={cta.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-hielo/20 bg-white px-5 py-2.5 text-sm font-semibold text-hielo shadow-[0_6px_16px_rgb(45_107_100_/_0.08)] transition hover:border-hielo hover:bg-hielo hover:text-white"
        >
          {cta.label}
        </a>
      ) : null}
    </aside>
  );
}
