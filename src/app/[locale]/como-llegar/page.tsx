import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.8!2d-3.3978!3d37.0944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd71f8b8c8c8c8c8%3A0x0!2sBorreguiles%2C%20Sierra%20Nevada!5e0!3m2!1ses!2ses!4v1";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/como-llegar",
    title: pickLocale(locale, "Cómo llegar", "Getting here"),
    description: pickLocale(locale, site.meetingPointEs, site.meetingPointEn),
  });
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
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="prose-page">
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

          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-hielo/10 shadow-lg">
              <iframe
                title={pickLocale(locale, "Mapa de Borreguiles, Sierra Nevada", "Map of Borreguiles, Sierra Nevada")}
                src={MAP_EMBED}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-hielo/70">
              {pickLocale(
                locale,
                "Punto de encuentro: salida del telecabina Al-Andalus, área de Borreguiles.",
                "Meeting point: exit of the Al-Andalus gondola, Borreguiles area.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
