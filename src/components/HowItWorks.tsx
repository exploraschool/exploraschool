import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";

const steps = [
  {
    n: "01",
    titleEs: "Elige tus clases",
    titleEn: "Choose your lessons",
    descEs: "Explora Full Day, medio día, cursos y particulares. Filtra por disciplina y nivel.",
    descEn: "Browse Full Day, half-day, courses and private lessons. Filter by discipline and level.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
      </svg>
    ),
  },
  {
    n: "02",
    titleEs: "Indica fecha y personas",
    titleEn: "Pick date and group size",
    descEs: "Selecciona el día en la estación, disciplina e instructor/a si lo deseas.",
    descEn: "Select your day at the resort, discipline and instructor if you wish.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    n: "03",
    titleEs: "Envía por email",
    titleEn: "Send by email",
    descEs: "Revisa tu reserva y envíala. Te confirmamos disponibilidad y precio final.",
    descEn: "Review your booking and send it. We confirm availability and final price.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

type HowItWorksProps = {
  locale: string;
};

export function HowItWorks({ locale }: HowItWorksProps) {
  return (
    <section className="section-padding bg-nieve">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            eyebrow={pickLocale(locale, "Cómo funciona", "How it works")}
            title={pickLocale(locale, "Reservar es fácil", "Booking is easy")}
            description={pickLocale(
              locale,
              "Tres pasos para asegurar tu plaza en la nieve. Sin pagos online: confirmamos todo por email.",
              "Three steps to secure your spot on the snow. No online payment: we confirm everything by email.",
            )}
          />
        </Reveal>

        <div className="relative mt-8 sm:mt-10 md:mt-12">
          <div className="step-connector" aria-hidden />
          <ol className="grid gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <li className="card-interactive relative h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-hielo to-hielo-light text-white shadow-md shadow-hielo/25">
                      {step.icon}
                    </div>
                    <span className="font-display text-3xl font-semibold text-hielo/15">{step.n}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-hielo sm:text-xl">
                    {pickLocale(locale, step.titleEs, step.titleEn)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted sm:mt-3">
                    {pickLocale(locale, step.descEs, step.descEn)}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={200}>
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-hielo/8 bg-white px-5 py-5 text-center sm:mt-10 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
            <p className="text-sm text-muted">
              {pickLocale(locale, "IVA incluido en todos los precios.", "VAT included in all prices.")}
            </p>
            <Link href="/clases" className="btn-primary !w-auto shrink-0">
              {pickLocale(locale, "Elegir clases", "Choose lessons")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
