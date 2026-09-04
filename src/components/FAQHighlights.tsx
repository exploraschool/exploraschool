import { FAQ_HIGHLIGHTS } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";
import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  tiempo: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  forfait: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
    </svg>
  ),
  encuentro: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  ),
  pago: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
};

type FAQHighlightsProps = {
  locale: string;
};

export function FAQHighlights({ locale }: FAQHighlightsProps) {
  return (
    <div className="grid grid-cols-2 grid-gap lg:grid-cols-4">
      {FAQ_HIGHLIGHTS.map((item) => (
        <a
          key={item.id}
          href={`#faq-${item.faqId}`}
          className="card-interactive flex h-full flex-col"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hielo/8 text-hielo">
            {icons[item.id]}
          </div>
          <p className="mt-3 text-sm font-semibold text-pizarra sm:mt-4">
            {pickLocale(locale, item.titleEs, item.titleEn)}
          </p>
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted sm:text-sm">
            {pickLocale(locale, item.bodyEs, item.bodyEn)}
          </p>
          <span className="mt-3 text-xs font-semibold text-accent">
            {pickLocale(locale, "Ver respuesta →", "Read answer →")}
          </span>
        </a>
      ))}
    </div>
  );
}
