import { pickLocale } from "@/lib/locale";

export function BlogProsCons({
  locale,
  pros,
  cons,
}: {
  locale: string;
  pros: string[];
  cons: string[];
}) {
  if (!pros.length && !cons.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-hielo/15 bg-hielo/[0.05] p-4 sm:p-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-hielo">
          {pickLocale(locale, "Pros", "Pros")}
        </p>
        <ul className="mt-3 space-y-2.5">
          {pros.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-pizarra">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hielo text-[0.7rem] font-bold text-white">
                +
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-accent/15 bg-accent/[0.04] p-4 sm:p-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
          {pickLocale(locale, "Contras", "Cons")}
        </p>
        <ul className="mt-3 space-y-2.5">
          {cons.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-pizarra">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/90 text-[0.7rem] font-bold text-white">
                −
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
