import { site } from "@/data/site";
import { tripAdvisorSummary } from "@/data/reviews";
import { getActiveInstructors } from "@/data/instructors";
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
      label: pickLocale(locale, "TripAdvisor", "TripAdvisor"),
      sub: `${tripAdvisorSummary.reviewCount}+ ${pickLocale(locale, "reseñas", "reviews")}`,
    },
    {
      value: String(instructors.length),
      label: pickLocale(locale, "Instructores", "Instructors"),
      sub: pickLocale(locale, "Titulados INEF", "Qualified professionals"),
    },
    {
      value: `${years}+`,
      label: pickLocale(locale, "Años en Sierra Nevada", "Years in Sierra Nevada"),
      sub: `${pickLocale(locale, "Desde", "Since")} ${site.foundedYear}`,
    },
    {
      value: "ES / EN",
      label: pickLocale(locale, "Idiomas", "Languages"),
      sub: pickLocale(locale, "Clases bilingües", "Bilingual lessons"),
    },
  ];

  return (
    <section className="border-y border-hielo/10 bg-white">
      <div className="container-page py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-display text-2xl font-semibold text-hielo md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-pizarra">{stat.label}</p>
              <p className="text-xs text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
