"use client";

import { useMemo, useState } from "react";
import { DisclosureItem, DisclosurePanel } from "@/components/DisclosureItem";
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
    <DisclosureItem
      defaultOpen={defaultOpen}
      title={pickLocale(locale, faq.questionEs, faq.questionEn)}
    >
      {pickLocale(locale, faq.answerEs, faq.answerEn)}
    </DisclosureItem>
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
      <DisclosurePanel>
        {filteredItems.map((faq, i) => (
          <FaqItem key={faq.id} faq={faq} locale={locale} defaultOpen={i === 0} />
        ))}
      </DisclosurePanel>
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
                className="w-full rounded-2xl border border-hielo/15 bg-white py-3.5 pl-11 pr-4 text-sm text-pizarra placeholder:text-muted transition focus:border-hielo focus:outline-none focus:shadow-[0_0_0_3px_rgb(45_107_100_/_0.15)]"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
                  : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
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
                    ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
                    : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
                }`}
              >
                {pickLocale(locale, category.labelEs, category.labelEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-hielo/10 bg-white px-6 py-10 text-center shadow-[0_2px_16px_rgb(10_18_25_/_0.04)]">
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
                <DisclosurePanel>
                  {categoryFaqs.map((faq) => (
                    <FaqItem key={faq.id} faq={faq} locale={locale} />
                  ))}
                </DisclosurePanel>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
