export function BlogAmazonCta({
  href,
  title,
  meta,
  label,
  note,
}: {
  href: string;
  title: string;
  meta?: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-hielo/15 bg-nieve/80 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold leading-snug text-pizarra">{title}</p>
        {meta ? <p className="mt-1 text-sm text-muted">{meta}</p> : null}
        {note ? <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p> : null}
      </div>
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-hielo/20 bg-white px-5 py-2.5 text-sm font-semibold text-hielo shadow-[0_6px_16px_rgb(45_107_100_/_0.08)] transition hover:border-hielo hover:bg-hielo hover:text-white sm:mt-0"
      >
        {label}
      </a>
    </div>
  );
}
