import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/Reveal";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { HomeFaqTeaser } from "@/components/HomeFaqTeaser";
import { getFaqsSorted } from "@/data/faqs";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";
import { faqAnswerPlainText } from "@/lib/faq-text";

type HomeClosingProps = {
  locale: string;
};

export function HomeClosing({ locale }: HomeClosingProps) {
  const teaserFaqs = getFaqsSorted().slice(0, 3).map((faq) => ({
    question: pickLocale(locale, faq.questionEs, faq.questionEn),
    answer: faqAnswerPlainText(pickLocale(locale, faq.answerEs, faq.answerEn)),
  }));

  return (
    <section className="section-padding-sm bg-nieve">
      <FaqJsonLd items={teaserFaqs} />
      <div className="container-page grid grid-gap-lg lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <div>
            <p className="eyebrow">{pickLocale(locale, "Dudas", "Questions")}</p>
            <h2 className="section-title mt-2">
              {pickLocale(
                locale,
                "Reserva, forfait y alquiler",
                "Booking, lift pass and rental",
              )}
            </h2>
            <div className="section-body-sm">
              <HomeFaqTeaser locale={locale} limit={3} />
            </div>
            <Link href="/preguntas-frecuentes" className="btn-secondary mt-5 !w-auto sm:mt-6">
              {pickLocale(locale, "Ver todas", "View all")}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-2xl mesh-dark px-5 py-7 text-nieve sm:px-7 sm:py-8">
            <p className="eyebrow-dark">{pickLocale(locale, "Reservas", "Bookings")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-nieve">
              {pickLocale(locale, "Envía tu solicitud", "Send your request")}
            </h2>
            <p className="mt-4 text-sm text-on-dark-muted">
              {pickLocale(
                locale,
                "Elige clases, añade al carrito y envía tu solicitud.",
                "Pick lessons, add to cart and send your request.",
              )}
            </p>
            <div className="btn-stack mt-5 sm:mt-6">
              <Link href="/clases" className="btn-primary">
                {pickLocale(locale, "Elegir clases", "Choose lessons")}
              </Link>
              <Link href="/reserva" className="btn-glass text-center">
                {pickLocale(locale, "Mi reserva", "My booking")}
              </Link>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass text-center"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
