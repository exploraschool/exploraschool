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
      value: `${tripAdvisorSummary.rating}★`,
      label: "TripAdvisor",
      sub: `${tripAdvisorSummary.reviewCount}+ ${pickLocale(locale, "reseñas", "reviews")}`,
      accent: "text-hielo",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      value: String(instructors.length),
      label: pickLocale(locale, "Instructores", "Instructors"),
      sub: pickLocale(locale, "Titulados INEF", "Qualified professionals"),
      accent: "text-hielo",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    {
      value: `${years}+`,
      label: pickLocale(locale, "Años en Sierra Nevada", "Years in Sierra Nevada"),
      sub: `${pickLocale(locale, "Desde", "Since")} ${site.foundedYear}`,
      accent: "text-accent",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
    {
      value: "ES / EN",
      label: pickLocale(locale, "Idiomas", "Languages"),
      sub: pickLocale(locale, "Clases bilingües", "Bilingual lessons"),
      accent: "text-hielo-light",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative z-10 -mt-5 sm:-mt-6">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-hielo/8 bg-white px-3 py-3 shadow-[0_8px_32px_rgba(10,18,25,0.08)] sm:gap-3 sm:px-4 sm:py-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div className="group flex items-center gap-2.5 rounded-lg p-2 md:gap-3 md:p-2.5">
                <div className={`shrink-0 ${stat.accent}`}>{stat.icon}</div>
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
