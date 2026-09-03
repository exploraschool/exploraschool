import Link from "next/link";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  /** Base path with existing query (status etc), without page */
  hrefForPage: (page: number) => string;
  itemLabel?: { singular: string; plural: string };
};

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  hrefForPage,
  itemLabel = { singular: "reserva", plural: "reservas" },
}: AdminPaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    return totalItems > 0 ? (
      <p className="mt-6 text-center text-sm text-muted">
        {totalItems} {totalItems === 1 ? itemLabel.singular : itemLabel.plural}
      </p>
    ) : null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages = visiblePageNumbers(page, totalPages);

  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted">
        Mostrando {from}–{to} de {totalItems}
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            page <= 1
              ? "pointer-events-none border-hielo/10 text-muted/40"
              : "border-hielo/20 text-hielo hover:border-hielo/40 hover:bg-frost/20"
          }`}
        >
          Anterior
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
          Siguiente
        </Link>
      </nav>
    </div>
  );
}

function visiblePageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) result.push("…");
  for (let p = start; p <= end; p += 1) result.push(p);
  if (end < total - 1) result.push("…");
  result.push(total);
  return result;
}
