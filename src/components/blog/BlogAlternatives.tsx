import Link from "next/link";
import { localizedHref } from "@/lib/blog-article";
import { pickLocale } from "@/lib/locale";

export type BlogAlternativeItem = {
  title: string;
  why: string;
  href: string;
};

export function BlogAlternatives({
  locale,
  items,
}: {
  locale: string;
  items: BlogAlternativeItem[];
}) {
  if (!items.length) return null;
  return (
    <section id="alternativas" className="scroll-mt-28">
      <h2 className="scroll-mt-28 mt-12 mb-4 font-display text-[1.65rem] font-bold tracking-tight text-pizarra sm:mt-14 sm:text-3xl">
        {pickLocale(locale, "Si este no encaja", "If this isn’t the one")}
      </h2>
      <p className="mb-5 max-w-prose text-[1.075rem] leading-relaxed text-pizarra/90">
        {pickLocale(
          locale,
          "No hace falta forzar la compra. Estas son salidas honestas si el producto no es para ti.",
          "You don’t have to force the purchase. These are honest ways out if the product isn’t for you.",
        )}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={`${item.href}-${item.title}`}
            className="flex flex-col rounded-2xl border border-hielo/12 bg-white p-5"
          >
            <h3 className="font-display text-xl font-bold text-pizarra">{item.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.why}</p>
            <Link
              href={localizedHref(locale, item.href)}
              className="mt-4 text-sm font-semibold text-hielo underline-offset-2 hover:underline"
            >
              {pickLocale(locale, "Ver opción", "See option")}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
