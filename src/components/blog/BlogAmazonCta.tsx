import { AmazonAssociateButton } from "@/components/blog/AmazonAssociateButton";

export function BlogAmazonCta({
  href,
  title,
  meta,
  locale,
  note,
}: {
  href: string;
  title: string;
  meta?: string;
  locale: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-hielo/15 bg-nieve/80 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold leading-snug text-pizarra">{title}</p>
        {meta ? <p className="mt-1 text-sm text-muted">{meta}</p> : null}
        {note ? <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p> : null}
      </div>
      <AmazonAssociateButton href={href} locale={locale} className="mt-4 shrink-0 sm:mt-0" />
    </div>
  );
}
