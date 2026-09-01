import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { ContactInfoPanel } from "@/components/ContactInfoPanel";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildPageMetadata({
    locale,
    path: "/contacto",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ContactoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <section className="page-header">
        <div className="container-page relative">
          <p className="eyebrow">{pickLocale(locale, "Contacto", "Contact")}</p>
          <h1 className="page-title mt-2 sm:mt-2.5">{t("title")}</h1>
          <p className="page-lead">{t("subtitle")}</p>

          <div className="page-actions">
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !w-auto"
            >
              WhatsApp
            </a>
            <a href={`tel:${site.phone}`} className="btn-secondary !w-auto">
              {site.phoneDisplay}
            </a>
            <Link href="/reserva" className="btn-secondary !w-auto">
              {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <Reveal>
            <div className="grid grid-gap-lg lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <ContactForm />
              <ContactInfoPanel
                locale={locale}
                bookingTitle={t("bookingTitle")}
                bookingDesc={t("bookingDesc")}
                emailTitle={t("emailTitle")}
                phoneTitle={t("phoneTitle")}
                hoursTitle={t("hoursTitle")}
              />
            </div>
          </Reveal>

          <div className="section-body-sm rounded-2xl border border-hielo/10 bg-nieve px-6 py-5 text-center text-sm text-muted sm:px-8 sm:py-6">
            {pickLocale(
              locale,
              "¿Tienes dudas antes de escribirnos? Consulta las ",
              "Have questions before writing to us? Check the ",
            )}
            <Link href="/preguntas-frecuentes" className="font-semibold text-hielo hover:text-accent">
              {pickLocale(locale, "preguntas frecuentes", "FAQs")}
            </Link>
            {pickLocale(locale, " o las ", " or ")}
            <Link href="/clases" className="font-semibold text-hielo hover:text-accent">
              {pickLocale(locale, "clases y tarifas", "lessons & prices")}
            </Link>
            .
          </div>
        </div>
      </section>
    </>
  );
}
