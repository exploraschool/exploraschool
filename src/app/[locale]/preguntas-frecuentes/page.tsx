import { setRequestLocale } from "next-intl/server";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { CTASection } from "@/components/CTASection";
import { PageHeader } from "@/components/PageHeader";
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
    title: pickLocale(locale, "Preguntas frecuentes", "FAQs"),
    description: pickLocale(
      locale,
      "Resuelve tus dudas sobre clases, forfait, material y reservas en Explora School & Club.",
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

      <PageHeader
        eyebrow="FAQs"
        title={pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
      />

      <section className="section-padding">
        <div className="container-page max-w-3xl">
          <FAQAccordion locale={locale} />
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
