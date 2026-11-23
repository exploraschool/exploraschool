import { FaqJsonLd } from "@/components/FaqJsonLd";
import { FaqRichText } from "@/components/FaqRichText";
import { Link } from "@/i18n/routing";
import type { AeoFaq, AeoLink } from "@/data/landing-aeo";
import { aeoFaqsForLocale } from "@/data/landing-aeo";
import { contentLinkHref } from "@/lib/content-href";
import { pickLocale } from "@/lib/locale";

type LandingFaqSectionProps = {
  locale: string;
  faqs: AeoFaq[];
  links?: AeoLink[];
  titleEs?: string;
  titleEn?: string;
  className?: string;
};

export function LandingFaqSection({
  locale,
  faqs,
  links,
  titleEs = "Preguntas frecuentes",
  titleEn = "Frequently asked questions",
  className = "section-padding bg-white",
}: LandingFaqSectionProps) {
  const items = aeoFaqsForLocale(locale, faqs);

  return (
    <section className={className}>
      <FaqJsonLd items={items} />
      <div className="container-page">
        <h2 className="section-title">{pickLocale(locale, titleEs, titleEn)}</h2>
        <div className="mt-6 divide-y divide-hielo/10 overflow-hidden rounded-2xl border border-hielo/10 bg-nieve/40">
          {faqs.map((faq) => (
            <details
              key={faq.questionEs}
              className="group bg-white px-4 py-3.5 sm:px-5 sm:py-4"
            >
              <summary className="cursor-pointer list-none font-display text-sm font-semibold text-hielo marker:content-none [&::-webkit-details-marker]:hidden sm:text-base">
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
                <FaqRichText
                  text={pickLocale(locale, faq.answerEs, faq.answerEn)}
                  locale={locale}
                />
              </div>
            </details>
          ))}
        </div>

        {links && links.length > 0 ? (
          <nav
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm"
            aria-label={pickLocale(locale, "Enlaces relacionados", "Related links")}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={contentLinkHref(link.href, locale)}
                className="font-semibold text-hielo underline decoration-hielo/25 underline-offset-2 hover:decoration-hielo"
              >
                {pickLocale(locale, link.labelEs, link.labelEn)}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
