import { setRequestLocale } from "next-intl/server";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FAQHighlights } from "@/components/FAQHighlights";
import { FAQQuickHelp } from "@/components/FAQQuickHelp";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQ_CATEGORIES, getFaqsSorted } from "@/data/faqs";
import { faqAnswerPlainText } from "@/lib/faq-text";
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
      "Forfait, cajeros en parkings y Silla del Pueblo, punto de encuentro, material y reservas en Explora School & Club, Sierra Nevada.",
      "Lift pass machines, meeting point, equipment and bookings at Explora School & Club, Sierra Nevada.",
    ),
  });
}

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const faqItems = getFaqsSorted().map((f) => ({
    question: pickLocale(locale, f.questionEs, f.questionEn),
    answer: faqAnswerPlainText(pickLocale(locale, f.answerEs, f.answerEn)),
  }));

  return (
    <>
      <FaqJsonLd items={faqItems} />

      <PageHeader
        eyebrow="FAQs"
        title={pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
        description={pickLocale(
          locale,
          "Lo esencial para llegar a tiempo, sacar el forfait sin colas y encontrar a tu instructor. Si no está aquí, te respondemos en minutos.",
          "The essentials to arrive on time, collect your lift pass without queues and find your instructor. If it is not here, we will reply in minutes.",
        )}
      >
        <nav
          className="flex flex-wrap gap-2.5"
          aria-label={pickLocale(locale, "Temas de la página", "Page topics")}
        >
          {FAQ_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#faq-${category.id}`}
              className="inline-flex items-center rounded-full border border-hielo/15 bg-white px-4 py-2 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-nieve"
            >
              {pickLocale(locale, category.labelEs, category.labelEn)}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section className="section-band bg-white">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">{pickLocale(locale, "Lo esencial", "The essentials")}</p>
            <h2 className="section-title mt-2">
              {pickLocale(locale, "Cuatro cosas que conviene tener claras", "Four things worth knowing first")}
            </h2>
          </Reveal>
          <div className="section-body-sm">
            <FAQHighlights locale={locale} />
          </div>
        </div>
      </section>

      <section className="section-padding bg-nieve">
        <div className="container-page max-w-4xl">
          <SectionHeader
            eyebrow={pickLocale(locale, "Dudas habituales", "Common questions")}
            title={pickLocale(locale, "Todo lo que debes saber", "Everything you need to know")}
            description={pickLocale(
              locale,
              "Agrupadas por tema: reservas, estación y el día de la clase. Usa el buscador si vienes con una duda concreta.",
              "Grouped by topic: bookings, the resort and lesson day. Use the search if you have a specific question.",
            )}
          />
          <div className="section-body">
            <FAQAccordion locale={locale} grouped showSearch />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "¿Sigue la duda?", "Still stuck?")}
              title={pickLocale(locale, "Habla con el equipo", "Talk to the team")}
              description={pickLocale(
                locale,
                "Si tu duda es urgente o prefieres que te orientemos con tu reserva, elige el canal que te resulte más cómodo.",
                "If your question is urgent or you would rather we help with your booking, choose the channel that suits you.",
              )}
            />
          </Reveal>
          <div className="section-body-sm">
            <FAQQuickHelp locale={locale} />
          </div>
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
