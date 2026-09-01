import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

const steps = [
  {
    n: "01",
    titleEs: "Escríbenos",
    titleEn: "Message us",
    descEs: "WhatsApp, formulario o email. Cuéntanos fechas, nivel y número de personas.",
    descEn: "WhatsApp, form or email. Tell us dates, level and group size.",
  },
  {
    n: "02",
    titleEs: "Te asignamos instructor/a",
    titleEn: "We match your instructor",
    descEs: "Elige disciplina y, si quieres, instructor/a por nombre. Confirmamos horario y punto de encuentro.",
    descEn: "Choose your discipline and optionally your instructor by name. We confirm schedule and meeting point.",
  },
  {
    n: "03",
    titleEs: "Nos vemos en Al-Andalus",
    titleEn: "Meet at Al-Andalus",
    descEs: "Salida del telecabina, área Borreguiles. Uniforme Explora. Forfait y material aparte (te orientamos).",
    descEn: "Gondola exit, Borreguiles area. Explora uniform. Lift pass and gear separate (we guide you).",
  },
];

type HowItWorksProps = {
  locale: string;
};

export function HowItWorks({ locale }: HowItWorksProps) {
  return (
    <section className="section-padding bg-nieve">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">{pickLocale(locale, "Cómo funciona", "How it works")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Reservar es fácil", "Booking is easy")}
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="card relative overflow-hidden">
              <span className="font-display text-5xl font-semibold text-hielo/10">{step.n}</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-hielo">
                {pickLocale(locale, step.titleEs, step.titleEn)}
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {pickLocale(locale, step.descEs, step.descEn)}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-sm text-muted">
          {pickLocale(locale, "IVA incluido en todos los precios.", "VAT included in all prices.")}{" "}
          <a href={site.whatsappUrl} className="font-semibold text-accent hover:underline">
            {pickLocale(locale, "Reservar ahora", "Book now")}
          </a>
        </p>
      </div>
    </section>
  );
}
