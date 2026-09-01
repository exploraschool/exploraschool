import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
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
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page">
          <p className="eyebrow">{pickLocale(locale, "Contacto", "Contact")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <ContactForm />

          <div className="space-y-8">
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-hielo">{t("whatsappTitle")}</h2>
              <p className="mt-2 text-sm text-muted">{t("whatsappDesc")}</p>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 inline-flex"
              >
                WhatsApp
              </a>
            </div>

            <div className="card">
              <h2 className="font-display text-lg font-semibold text-hielo">{t("phoneTitle")}</h2>
              <a href={`tel:${site.phone}`} className="mt-2 block text-lg font-semibold text-accent">
                {site.phoneDisplay}
              </a>
              <p className="mt-4 text-sm text-muted">{t("hoursTitle")}: {site.openingHours}</p>
            </div>

            <div className="card">
              <h2 className="font-display text-lg font-semibold text-hielo">{t("emailTitle")}</h2>
              <a href={`mailto:${site.email}`} className="mt-2 block text-hielo hover:text-accent">
                {site.email}
              </a>
            </div>

            <div className="card">
              <h2 className="font-display text-lg font-semibold text-hielo">
                {pickLocale(locale, "Ubicación", "Location")}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {site.nap.addressLocality}, {site.nap.addressRegion} {site.nap.postalCode}
              </p>
              <p className="mt-2 text-sm text-muted">
                {pickLocale(locale, site.meetingPointEs, site.meetingPointEn)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
