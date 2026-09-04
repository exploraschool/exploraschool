import type { ReactNode } from "react";
import { pickLocale } from "@/lib/locale";

export function BlogCallout({
  locale,
  title,
  children,
}: {
  locale: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-hielo/15 bg-hielo/[0.06] px-5 py-4 sm:px-6 sm:py-5">
      <span className="absolute inset-y-0 left-0 w-1 bg-hielo" aria-hidden />
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-hielo">
        {title || pickLocale(locale, "Consejo del instructor", "Instructor note")}
      </p>
      <div className="mt-2 text-[1.02rem] leading-relaxed text-pizarra">{children}</div>
    </aside>
  );
}
