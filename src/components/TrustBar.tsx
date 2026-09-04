import { site } from "@/data/site";
import { tripAdvisorSummary } from "@/data/reviews";
import { getActiveInstructors } from "@/data/instructors";
import { Reveal } from "@/components/Reveal";
import { pickLocale } from "@/lib/locale";

type TrustBarProps = {
  locale: string;
};

export function TrustBar({ locale }: TrustBarProps) {
  const instructors = getActiveInstructors();
  const years = new Date().getFullYear() - site.foundedYear;

  const stats = [
    {
      value: pickLocale(locale, "IVA incl.", "VAT incl."),
      label: pickLocale(locale, "En todas las tarifas", "On all rates"),
      accent: "text-hielo",
    },
    {
      value: `${tripAdvisorSummary.rating}★`,
      label: "TripAdvisor",
      accent: "text-hielo",
    },
    {
      value: String(instructors.length),
      label: pickLocale(locale, "Instructores", "Instructors"),
      accent: "text-hielo",
    },
    {
      value: `${years}+`,
      label: pickLocale(locale, "Años en Sierra Nevada", "Years in Sierra Nevada"),
      accent: "text-hielo",
    },
  ];

  return (
    <section className="home-trust-bar relative z-10">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-hielo/8 bg-white px-3 py-3 shadow-[0_8px_32px_rgba(10,18,25,0.08)] sm:gap-2.5 sm:px-4 sm:py-3.5 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div className="group rounded-lg p-3 md:p-3.5">
                <div className="min-w-0">
                  <p className={`font-display text-lg font-semibold leading-none sm:text-xl ${stat.accent}`}>{stat.value}</p>
                  <p className="mt-0.5 truncate text-[0.65rem] font-semibold text-pizarra sm:text-xs">{stat.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
