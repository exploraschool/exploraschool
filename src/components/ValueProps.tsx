import { Reveal } from "@/components/Reveal";
import { pickLocale } from "@/lib/locale";

type ValuePropsProps = {
  locale: string;
};

const props = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
    titleEs: "Titulados TD I–III",
    titleEn: "TD I–III certified",
    descEs: "INEF, TECO, TAFAD y más",
    descEn: "INEF, TECO, TAFAD and more",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    titleEs: "Todos los niveles",
    titleEn: "All levels",
    descEs: "Desde 3 años hasta experto",
    descEn: "From age 3 to expert",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    titleEs: "Horarios flexibles",
    titleEn: "Flexible schedules",
    descEs: "Día completo, 2 h y 3 h · 1–8 participantes",
    descEn: "Full day, 2 h and 3 h · 1–8 participants",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    titleEs: "Seguridad primero",
    titleEn: "Safety first",
    descEs: "Entorno seguro y personalizado",
    descEn: "Safe, personalised environment",
  },
];

export function ValueProps({ locale }: ValuePropsProps) {
  return (
    <section className="section-band bg-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
          {props.map((prop, i) => (
            <Reveal key={prop.titleEs} delay={i * 60}>
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hielo/8 text-hielo transition-colors hover:bg-accent/10 hover:text-accent">
                  {prop.icon}
                </div>
                <div className="mt-3 sm:mt-0">
                  <p className="text-sm font-semibold text-pizarra">
                    {pickLocale(locale, prop.titleEs, prop.titleEn)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {pickLocale(locale, prop.descEs, prop.descEn)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
