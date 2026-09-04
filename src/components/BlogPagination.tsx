import { Link } from "@/i18n/routing";
import { BLOG_PAGE_SIZE } from "@/lib/blog-catalog";
import { pickLocale } from "@/lib/locale";

type BlogPaginationProps = {
  locale: string;
  page: number;
  totalPages: number;
  totalItems: number;
  hrefForPage: (page: number) => string;
  itemLabel: { es: { singular: string; plural: string }; en: { singular: string; plural: string } };
};

export function BlogPagination({
  locale,
  page,
  totalPages,
  totalItems,
  hrefForPage,
  itemLabel,
}: BlogPaginationProps) {
  if (totalItems === 0) return null;

  const label = pickLocale(locale, itemLabel.es, itemLabel.en);
  const noun = totalItems === 1 ? label.singular : label.plural;

  if (totalPages <= 1) {
    return (
      <p className="mt-8 text-center text-sm text-muted">
        {totalItems} {noun}
      </p>
    );
  }

  const start = (page - 1) * BLOG_PAGE_SIZE + 1;
  const end = Math.min(page * BLOG_PAGE_SIZE, totalItems);
  const pages = visiblePageNumbers(page, totalPages);

  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted">
        {pickLocale(
          locale,
          `Mostrando ${start}–${end} de ${totalItems}`,
          `Showing ${start}–${end} of ${totalItems}`,
        )}
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label={pickLocale(locale, "Paginación", "Pagination")}>
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            page <= 1
              ? "pointer-events-none border-hielo/10 text-muted/40"
              : "border-hielo/20 text-hielo hover:border-hielo/40 hover:bg-frost/20"
          }`}
        >
          {pickLocale(locale, "Anterior", "Previous")}
        </Link>
        {pages.map((entry, index) =>
          entry === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={hrefForPage(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={`inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-1.5 text-sm font-semibold transition ${
                entry === page
                  ? "bg-pizarra text-nieve"
                  : "border border-hielo/15 text-pizarra hover:border-hielo/30 hover:bg-frost/20"
              }`}
            >
              {entry}
            </Link>
          ),
        )}
        <Link
          href={hrefForPage(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            page >= totalPages
              ? "pointer-events-none border-hielo/10 text-muted/40"
              : "border-hielo/20 text-hielo hover:border-hielo/40 hover:bg-frost/20"
          }`}
        >
          {pickLocale(locale, "Siguiente", "Next")}
        </Link>
      </nav>
    </div>
  );
}

function visiblePageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) result.push("…");
  for (let p = start; p <= end; p += 1) result.push(p);
  if (end < total - 1) result.push("…");
  result.push(total);
  return result;
}
