import type { BlogTocItem } from "@/lib/blog-article";
import { pickLocale } from "@/lib/locale";

export function BlogToc({
  items,
  locale,
}: {
  items: BlogTocItem[];
  locale: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav
      aria-label={pickLocale(locale, "Índice del artículo", "Article contents")}
      className="rounded-2xl border border-hielo/12 bg-white p-5 shadow-[0_8px_24px_rgb(14_14_15_/_0.04)]"
    >
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-hielo">
        {pickLocale(locale, "En este artículo", "In this article")}
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex gap-3 text-[0.95rem] leading-snug text-pizarra transition hover:text-hielo"
            >
              <span className="w-5 shrink-0 text-xs font-bold text-hielo/70 group-hover:text-hielo">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="underline-offset-4 group-hover:underline">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
