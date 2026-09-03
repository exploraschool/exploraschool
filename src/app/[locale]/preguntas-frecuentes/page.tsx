import { setRequestLocale } from "next-intl/server";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FAQQuickHelp } from "@/components/FAQQuickHelp";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Link } from "@/i18n/routing";
import { faqs } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/preguntas-frecuentes",
    title: pickLocale(
      locale,
      "Preguntas frecuentes sobre clases de esquí en Sierra Nevada",
      "FAQs about ski lessons in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Resuelve dudas sobre clases, forfait, material, punto de encuentro y reservas en Explora School & Club, Sierra Nevada.",
      "Answers about lessons, lift passes, equipment and bookings at Explora School & Club.",
    ),
  });
}

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const faqItems = faqs.map((f) => ({
    question: pickLocale(locale, f.questionEs, f.questionEn),
    answer: pickLocale(locale, f.answerEs, f.answerEn),
  }));

  return (
    <>
      <FaqJsonLd items={faqItems} />

      <section className="page-header">
        <div className="container-page relative">
          <p className="eyebrow">FAQs</p>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
          </h1>
          <p className="page-lead">
            {pickLocale(
              locale,
              "Encuentra respuestas rápidas sobre reservas, forfait, material y el día de tu clase. Si no encuentras lo que buscas, estamos a un mensaje de distancia.",
              "Find quick answers about bookings, lift passes, equipment and your lesson day. If you cannot find what you need, we are just a message away.",
            )}
          </p>
        </div>
      </section>

      <section className="section-band bg-nieve">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "¿Necesitas ayuda?", "Need help?")}
              title={pickLocale(locale, "Contacta con nosotros", "Get in touch")}
              description={pickLocale(
                locale,
                "Si tu duda es urgente o prefieres hablar con alguien del equipo, elige el canal que te resulte más cómodo.",
                "If your question is urgent or you prefer to speak with the team, choose the channel that suits you best.",
              )}
            />
          </Reveal>
          <div className="section-body-sm">
            <FAQQuickHelp locale={locale} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page max-w-4xl">
          <SectionHeader
            eyebrow={pickLocale(locale, "Dudas habituales", "Common questions")}
            title={pickLocale(locale, "Todo lo que debes saber", "Everything you need to know")}
            description={pickLocale(
              locale,
              "Hemos agrupado las preguntas por tema para que encuentres lo que buscas más rápido.",
              "We have grouped questions by topic so you can find what you need faster.",
            )}
          />
          <div className="section-body">
            <FAQAccordion locale={locale} grouped showSearch />
          </div>

          <div className="section-body-sm rounded-2xl border border-hielo/10 bg-white px-5 py-7 text-center sm:px-8 sm:py-8">
            <h2 className="font-display text-xl font-semibold text-hielo">
              {pickLocale(locale, "¿No encuentras tu respuesta?", "Cannot find your answer?")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
              {pickLocale(
                locale,
                "Escríbenos y te ayudamos con tu reserva, material o cualquier detalle de tu día en la nieve.",
                "Write to us and we will help with your booking, equipment or any detail about your day on the snow.",
              )}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/contacto" className="btn-primary !w-auto">
                {pickLocale(locale, "Ir a contacto", "Go to contact")}
              </Link>
              <Link href="/clases" className="btn-secondary !w-auto">
                {pickLocale(locale, "Ver clases y tarifas", "View lessons & prices")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
