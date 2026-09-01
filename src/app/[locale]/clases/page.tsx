import { setRequestLocale } from "next-intl/server";
import { PriceTables } from "@/components/PriceTables";
import { CTASection } from "@/components/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/clases",
    title: pickLocale(locale, "Clases y tarifas", "Lessons & prices"),
    description: pickLocale(
      locale,
      "Consulta nuestras clases de esquí, snowboard y telemark en Sierra Nevada. Precios con IVA incluido.",
      "Browse our ski, snowboard and telemark lessons in Sierra Nevada. Prices include VAT.",
    ),
  });
}

export default async function ClasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const steps = [
    {
      titleEs: "Elige tu clase",
      titleEn: "Choose your lesson",
      descEs: "Particulares, full day, grupales o cursos. Todos los precios con IVA incluido.",
      descEn: "Private, full day, group or courses. All prices include VAT.",
    },
    {
      titleEs: "Selecciona fecha y personas",
      titleEn: "Pick date and group size",
      descEs: "Indica el día, número de participantes e instructor/a si lo deseas.",
      descEn: "Specify the day, number of participants and preferred instructor if you wish.",
    },
    {
      titleEs: "Envía por email",
      titleEn: "Send by email",
      descEs: "Revisa tu carrito y envía la solicitud. Te confirmamos la disponibilidad por email.",
      descEn: "Review your cart and send the request. We confirm availability by email.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={pickLocale(locale, "Servicios", "Services")}
        title={pickLocale(locale, "Clases y tarifas", "Lessons & prices")}
        description={pickLocale(
          locale,
          "Consulta nuestros servicios y escoge el que más se adapte a tus necesidades. Añade al carrito y reserva por email.",
          "Browse our services and choose the format that suits you best. Add to your cart and book by email.",
        )}
      />

      <section className="border-b border-hielo/10 bg-nieve py-10 sm:py-12">
        <div className="container-page">
          <Reveal>
            <h2 className="text-center font-display text-xl font-semibold text-hielo sm:text-2xl">
              {pickLocale(locale, "Cómo reservar", "How to book")}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.titleEs} delay={i * 100}>
                <div className="card text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-hielo text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display font-semibold text-hielo">
                    {pickLocale(locale, step.titleEs, step.titleEn)}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {pickLocale(locale, step.descEs, step.descEn)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/reserva" className="btn-primary inline-flex !w-auto">
              {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <PriceTables locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
