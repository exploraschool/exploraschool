import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader
        eyebrow={pickLocale(locale, "Contacto", "Contact")}
        title={t("title")}
        description={t("subtitle")}
      />

      <section className="section-padding">
        <div className="container-page grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          <ContactForm />

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 md:gap-5">
            <div className="card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <h2 className="font-display text-base font-semibold text-hielo sm:text-lg">{t("bookingTitle")}</h2>
              <p className="mt-2 text-sm text-muted">{t("bookingDesc")}</p>
              <Link href="/reserva" className="btn-primary mt-4 !w-auto">
                {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
              </Link>
            </div>

            <div className="card">
              <h2 className="font-display text-base font-semibold text-hielo sm:text-lg">{t("emailTitle")}</h2>
              <a href={`mailto:${site.email}`} className="mt-2 block text-sm text-hielo hover:text-accent sm:text-base">
                {site.email}
              </a>
              <p className="mt-3 text-sm text-muted">
                {pickLocale(locale, "Para reservas, consultas y confirmaciones.", "For bookings, enquiries and confirmations.")}
              </p>
            </div>

            <div className="card">
              <h2 className="font-display text-base font-semibold text-hielo sm:text-lg">{t("phoneTitle")}</h2>
              <a href={`tel:${site.phone}`} className="mt-2 block text-base font-semibold text-accent sm:text-lg">
                {site.phoneDisplay}
              </a>
              <p className="mt-3 text-sm text-muted sm:mt-4">{t("hoursTitle")}: {site.openingHours}</p>
            </div>

            <div className="card">
              <h2 className="font-display text-base font-semibold text-hielo sm:text-lg">
                {pickLocale(locale, "Ubicación", "Location")}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {site.nap.addressLocality}, {site.nap.addressRegion} {site.nap.postalCode}
              </p>
              <p className="mt-2 text-sm text-muted">
                {pickLocale(locale, site.meetingPointEs, site.meetingPointEn)}
              </p>
              <Link href="/como-llegar" className="mt-3 inline-flex text-sm font-semibold text-hielo hover:text-accent">
                {pickLocale(locale, "Cómo llegar →", "Getting here →")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
