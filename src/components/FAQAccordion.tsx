"use client";

import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, faqs, type Faq, type FaqCategory } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";

type FAQAccordionProps = {
  locale: string;
  limit?: number;
  grouped?: boolean;
  showSearch?: boolean;
};

function FaqItem({ faq, locale, defaultOpen = false }: { faq: Faq; locale: string; defaultOpen?: boolean }) {
  return (
    <details
      className="group border-b border-hielo/10 last:border-b-0"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition hover:bg-nieve/80 sm:px-6 sm:py-4 [&::-webkit-details-marker]:hidden">
        <span className="pr-2 font-semibold text-pizarra">
          {pickLocale(locale, faq.questionEs, faq.questionEn)}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hielo/15 text-hielo transition group-open:rotate-180">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-4 text-sm leading-relaxed text-muted sm:px-6 sm:pb-5">
        {pickLocale(locale, faq.answerEs, faq.answerEn)}
      </div>
    </details>
  );
}

export function FAQAccordion({ locale, limit, grouped = false, showSearch = false }: FAQAccordionProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");

  const baseItems = limit ? faqs.slice(0, limit) : faqs;

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseItems.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const question = pickLocale(locale, faq.questionEs, faq.questionEn).toLowerCase();
      const answer = pickLocale(locale, faq.answerEs, faq.answerEn).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [activeCategory, baseItems, locale, query]);

  if (!grouped) {
    return (
      <div className="overflow-hidden rounded-2xl border border-hielo/10 bg-white">
        {filteredItems.map((faq, i) => (
          <FaqItem key={faq.id} faq={faq} locale={locale} defaultOpen={i === 0} />
        ))}
      </div>
    );
  }

  const categoriesToShow =
    activeCategory === "all"
      ? FAQ_CATEGORIES
      : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);

  return (
    <div className="space-y-8">
      {showSearch && (
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">
              {pickLocale(locale, "Buscar en preguntas frecuentes", "Search FAQs")}
            </span>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={pickLocale(locale, "Buscar una pregunta…", "Search a question…")}
                className="w-full rounded-2xl border border-hielo/15 bg-white py-3.5 pl-11 pr-4 text-sm text-pizarra placeholder:text-muted focus:border-hielo focus:outline-none"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === "all"
                  ? "bg-hielo text-white"
                  : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
              }`}
            >
              {pickLocale(locale, "Todas", "All")}
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category.id
                    ? "bg-hielo text-white"
                    : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
                }`}
              >
                {pickLocale(locale, category.labelEs, category.labelEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-hielo/10 bg-white px-6 py-10 text-center">
          <p className="font-semibold text-pizarra">
            {pickLocale(locale, "No encontramos resultados", "No results found")}
          </p>
          <p className="mt-2 text-sm text-muted">
            {pickLocale(
              locale,
              "Prueba con otras palabras o escríbenos y te ayudamos personalmente.",
              "Try different words or write to us and we will help you personally.",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoriesToShow.map((category) => {
            const categoryFaqs = filteredItems.filter((faq) => faq.category === category.id);
            if (categoryFaqs.length === 0) return null;

            return (
              <section key={category.id} id={`faq-${category.id}`} className="scroll-mt-24">
                <div className="mb-4">
                  <h2 className="font-display text-xl font-semibold text-hielo sm:text-2xl">
                    {pickLocale(locale, category.labelEs, category.labelEn)}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {pickLocale(locale, category.descriptionEs, category.descriptionEn)}
                  </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-hielo/10 bg-white">
                  {categoryFaqs.map((faq) => (
                    <FaqItem key={faq.id} faq={faq} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
