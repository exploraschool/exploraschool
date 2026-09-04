import { setRequestLocale } from "next-intl/server";
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
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
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
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          {
            name: pickLocale(locale, "Preguntas frecuentes", "FAQs"),
            path: "/preguntas-frecuentes",
          },
        ]}
      />

      <PageHeader
        eyebrow="FAQs"
        title={pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
        description={pickLocale(
          locale,
          "Reserva, forfait, punto de encuentro y el día de la clase.",
          "Booking, lift pass, meeting point and lesson day.",
        )}
      >
        <nav
          className="flex flex-wrap gap-2"
          aria-label={pickLocale(locale, "Temas de la página", "Page topics")}
        >
          {FAQ_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#faq-${category.id}`}
              className="inline-flex items-center rounded-full border border-hielo/15 bg-nieve px-3.5 py-1.5 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-white hover:text-accent"
            >
              {pickLocale(locale, category.labelEs, category.labelEn)}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section className="section-band bg-white">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">{pickLocale(locale, "Antes de salir", "Before you go")}</p>
            <h2 className="section-title mt-2">
              {pickLocale(locale, "Cuatro datos para no fallar", "Four things not to miss")}
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
            eyebrow={pickLocale(locale, "Respuestas", "Answers")}
            title={pickLocale(locale, "Elige un tema o busca", "Pick a topic or search")}
            description={pickLocale(
              locale,
              "Escribe forfait, cajero o encuentro si vienes con una duda concreta.",
              "Type lift pass, machine or meeting point if you have a specific question.",
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
              eyebrow={pickLocale(locale, "¿No está aquí?", "Not here?")}
              title={pickLocale(locale, "Te respondemos", "We reply")}
              description={pickLocale(
                locale,
                "WhatsApp, teléfono, email o la reserva online.",
                "WhatsApp, phone, email or book online.",
              )}
            />
          </Reveal>
          <div className="section-body-sm">
            <FAQQuickHelp locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
