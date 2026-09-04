import { FAQ_HIGHLIGHTS } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";

type FAQHighlightsProps = {
  locale: string;
};

export function FAQHighlights({ locale }: FAQHighlightsProps) {
  return (
    <ol className="grid grid-cols-1 grid-gap sm:grid-cols-2 lg:grid-cols-4">
      {FAQ_HIGHLIGHTS.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#faq-${item.faqId}`}
            className="card-interactive flex h-full flex-col"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-hielo text-[0.8rem] font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-3 font-display text-base font-semibold text-hielo sm:mt-4">
              {pickLocale(locale, item.titleEs, item.titleEn)}
            </p>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-pizarra/75">
              {pickLocale(locale, item.bodyEs, item.bodyEn)}
            </p>
            <span className="mt-4 text-sm font-semibold text-accent">
              {pickLocale(locale, "Ver respuesta →", "Read answer →")}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
