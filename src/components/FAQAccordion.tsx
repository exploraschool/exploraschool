"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DisclosureItem, DisclosurePanel } from "@/components/DisclosureItem";
import { FaqRichText } from "@/components/FaqRichText";
import { FAQ_CATEGORIES, getFaqsSorted, type Faq, type FaqCategory } from "@/data/faqs";
import { faqAnswerPlainText } from "@/lib/faq-text";
import { pickLocale } from "@/lib/locale";
import { scrollToHash } from "@/lib/scroll-to-anchor";

type FAQAccordionProps = {
  locale: string;
  limit?: number;
  grouped?: boolean;
  showSearch?: boolean;
};

const categoryIcons: Record<FaqCategory, ReactNode> = {
  reservas: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  ),
  estacion: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  ),
  clase: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

function FaqItem({ faq, locale, defaultOpen = false }: { faq: Faq; locale: string; defaultOpen?: boolean }) {
  return (
    <DisclosureItem
      id={`faq-${faq.id}`}
      defaultOpen={defaultOpen}
      title={pickLocale(locale, faq.questionEs, faq.questionEn)}
    >
      <FaqRichText text={pickLocale(locale, faq.answerEs, faq.answerEn)} />
    </DisclosureItem>
  );
}

function chipClass(active: boolean): string {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
      : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30 hover:bg-frost/20"
  }`;
}

export function FAQAccordion({ locale, limit, grouped = false, showSearch = false }: FAQAccordionProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  const [hashId, setHashId] = useState<string | null>(null);
  const pendingScrollCategory = useRef<FaqCategory | null>(null);

  const baseItems = useMemo(() => {
    const sorted = getFaqsSorted();
    return limit ? sorted.slice(0, limit) : sorted;
  }, [limit]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseItems.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const question = pickLocale(locale, faq.questionEs, faq.questionEn).toLowerCase();
      const answer = faqAnswerPlainText(pickLocale(locale, faq.answerEs, faq.answerEn)).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [activeCategory, baseItems, locale, query]);

  useEffect(() => {
    function applyHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (id) setHashId(id);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    if (!hashId?.startsWith("faq-")) return;
    const faqId = hashId.slice("faq-".length);
    const faq = getFaqsSorted().find((item) => item.id === faqId);
    if (!faq) return;
    setActiveCategory("all");
    setQuery("");
  }, [hashId]);

  useEffect(() => {
    const target = pendingScrollCategory.current;
    if (!target || activeCategory !== target) return;
    pendingScrollCategory.current = null;
    return scrollToHash(`#faq-${target}`, { retries: 12, behavior: "smooth" });
  }, [activeCategory]);

  function selectCategory(category: FaqCategory | "all") {
    pendingScrollCategory.current = category === "all" ? null : category;
    setActiveCategory(category);
  }

  if (!grouped) {
    return (
      <DisclosurePanel>
        {filteredItems.map((faq, i) => (
          <FaqItem
            key={faq.id}
            faq={faq}
            locale={locale}
            defaultOpen={i === 0 || hashId === `faq-${faq.id}`}
          />
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
      {showSearch ? (
        <div className="space-y-4 rounded-2xl border border-hielo/10 bg-white/80 p-4 shadow-[0_2px_16px_rgb(10_18_25_/_0.04)] sm:p-5">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={pickLocale(
                  locale,
                  "Busca forfait, cajero, encuentro, pago…",
                  "Search lift pass, machine, meeting point, payment…",
                )}
                className="w-full rounded-2xl border border-hielo/15 bg-nieve py-3.5 pl-11 pr-4 text-sm text-pizarra placeholder:text-muted transition focus:border-hielo focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgb(45_107_100_/_0.15)]"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => selectCategory("all")} className={chipClass(activeCategory === "all")}>
              {pickLocale(locale, `Todas (${baseItems.length})`, `All (${baseItems.length})`)}
            </button>
            {FAQ_CATEGORIES.map((category) => {
              const count = baseItems.filter((faq) => faq.category === category.id).length;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={chipClass(activeCategory === category.id)}
                >
                  {pickLocale(locale, category.labelEs, category.labelEn)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

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
              <section key={category.id} id={`faq-${category.id}`} className="scroll-target">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hielo/8 text-hielo">
                    {categoryIcons[category.id]}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-hielo sm:text-2xl">
                      {pickLocale(locale, category.labelEs, category.labelEn)}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {pickLocale(locale, category.descriptionEs, category.descriptionEn)}
                    </p>
                  </div>
                </div>
                <DisclosurePanel>
                  {categoryFaqs.map((faq) => (
                    <FaqItem
                      key={faq.id}
                      faq={faq}
                      locale={locale}
                      defaultOpen={hashId === `faq-${faq.id}`}
                    />
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
