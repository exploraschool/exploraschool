import { FaqRichText } from "@/components/FaqRichText";
import { getFaqsSorted } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";

type HomeFaqTeaserProps = {
  locale: string;
  limit?: number;
};

/** Server-only FAQ teaser so the home page does not ship the full client FAQ catalog. */
export function HomeFaqTeaser({ locale, limit = 3 }: HomeFaqTeaserProps) {
  const faqs = getFaqsSorted().slice(0, limit);

  return (
    <div className="divide-y divide-hielo/10 overflow-hidden rounded-2xl border border-hielo/10 bg-white">
      {faqs.map((faq) => (
        <details key={faq.id} className="group px-4 py-3 sm:px-5 sm:py-3.5">
          <summary className="cursor-pointer list-none font-display text-sm font-semibold text-hielo marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-3">
              <span>{pickLocale(locale, faq.questionEs, faq.questionEn)}</span>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-base leading-none text-oro transition group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <div className="mt-2.5 text-sm leading-relaxed text-muted">
            <FaqRichText text={pickLocale(locale, faq.answerEs, faq.answerEn)} locale={locale} />
          </div>
        </details>
      ))}
    </div>
  );
}
