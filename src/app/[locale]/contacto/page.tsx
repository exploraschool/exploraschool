import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { ContactInfoPanel } from "@/components/ContactInfoPanel";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
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
      <BreadcrumbJsonLd
        locale={locale}
        items={[{ name: pickLocale(locale, "Contacto", "Contact"), path: "/contacto" }]}
      />
      <section className="page-header">
        <div className="container-page relative">
          <p className="eyebrow">{pickLocale(locale, "Contacto", "Contact")}</p>
          <h1 className="page-title mt-2 sm:mt-2.5">
            {pickLocale(locale, "¿Hablamos?", "Get in touch")}
          </h1>
          <p className="page-lead">
            {pickLocale(
              locale,
              "WhatsApp, teléfono o el formulario. Te respondemos lo antes posible.",
              "WhatsApp, phone or the form. We reply as soon as we can.",
            )}
          </p>
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
                hoursTitle={t("hoursTitle")}
              />
            </div>
          </Reveal>

          <div className="section-body-sm rounded-2xl border border-hielo/10 bg-nieve px-4 py-5 text-center text-sm text-muted sm:px-8 sm:py-6">
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
