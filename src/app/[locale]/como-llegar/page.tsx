import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pickLocale(locale, "Cómo llegar", "Getting here"),
    description: pickLocale(locale, site.meetingPointEs, site.meetingPointEn),
  };
}

export default async function ComoLlegarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">{pickLocale(locale, "Ubicación", "Location")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {pickLocale(locale, "Cómo llegar", "Getting here")}
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page max-w-3xl prose-page">
          <h2>{pickLocale(locale, "Dirección", "Address")}</h2>
          <p>
            {site.nap.name}
            <br />
            {site.nap.addressLocality}, {site.nap.addressRegion} {site.nap.postalCode}
            <br />
            {site.nap.addressCountry}
          </p>

          <h2>{pickLocale(locale, "Punto de encuentro", "Meeting point")}</h2>
          <p>{pickLocale(locale, site.meetingPointEs, site.meetingPointEn)}</p>

          <h2>{pickLocale(locale, "Cómo llegar a la estación", "Getting to the resort")}</h2>
          <p>
            {pickLocale(
              locale,
              "Sierra Nevada se encuentra a unos 30 km de Granada. Puedes llegar en coche, autobús desde Granada o servicios de transfer. El forfait se adquiere en Plaza de Andalucía o en sierranevada.es.",
              "Sierra Nevada is about 30 km from Granada. You can arrive by car, bus from Granada or transfer services. Lift passes are purchased at Plaza de Andalucía or sierranevada.es.",
            )}
          </p>

          <p>
            {pickLocale(
              locale,
              "¿Necesitas indicaciones concretas para tu día? Escríbenos por WhatsApp y te orientamos.",
              "Need specific directions for your day? Message us on WhatsApp and we will guide you.",
            )}
          </p>

          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 inline-flex">
            WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
