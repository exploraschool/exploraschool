import type { AeoSection } from "@/data/landing-aeo";
import { pickLocale } from "@/lib/locale";

type LandingAnswerBlocksProps = {
  locale: string;
  sections: AeoSection[];
  className?: string;
};

export function LandingAnswerBlocks({
  locale,
  sections,
  className = "section-padding bg-white",
}: LandingAnswerBlocksProps) {
  if (sections.length === 0) return null;

  return (
    <section className={className}>
      <div className="container-page max-w-3xl space-y-8 sm:space-y-10">
        {sections.map((section) => (
          <div key={section.headingEs}>
            <h2 className="font-display text-xl font-bold tracking-tight text-pizarra sm:text-2xl">
              {pickLocale(locale, section.headingEs, section.headingEn)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {pickLocale(locale, section.bodyEs, section.bodyEn)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
