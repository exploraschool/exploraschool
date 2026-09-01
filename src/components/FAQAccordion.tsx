"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";

type FAQAccordionProps = {
  locale: string;
  limit?: number;
};

export function FAQAccordion({ locale, limit }: FAQAccordionProps) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-hielo/10 rounded-xl border border-hielo/10 bg-white">
      {items.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span className="font-semibold text-pizarra">
                {pickLocale(locale, faq.questionEs, faq.questionEn)}
              </span>
              <span
                className={`shrink-0 text-hielo transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-relaxed text-pizarra/85">
                {pickLocale(locale, faq.answerEs, faq.answerEn)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
