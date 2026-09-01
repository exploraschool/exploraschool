import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { getMeetingPointEmbedUrl } from "@/lib/maps";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

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

  const mapEmbed = getMeetingPointEmbedUrl(locale);

  return (
    <>
      <PageHeader
        eyebrow={pickLocale(locale, "Ubicación", "Location")}
        title={pickLocale(locale, "Cómo llegar", "Getting here")}
      />

      <section className="section-padding">
        <div className="container-page grid grid-gap-lg md:grid-cols-2">
          <div className="prose-page">
            <h2>{pickLocale(locale, "Dirección", "Address")}</h2>
            <p>
              {site.meetingPoint.name}
              <br />
              {site.nap.streetAddress}, {site.nap.addressLocality}
              <br />
              {site.nap.addressRegion} {site.nap.postalCode}, {site.nap.addressCountry}
            </p>

            <h2>{pickLocale(locale, "Punto de encuentro", "Meeting point")}</h2>
            <p>{pickLocale(locale, site.meetingPointEs, site.meetingPointEn)}</p>

            <h2>{pickLocale(locale, "Cómo llegar a la estación", "Getting to the resort")}</h2>
            <p>
              {pickLocale(
                locale,
                "Sierra Nevada está a unos 30 km de Granada. Puedes llegar en coche, autobús desde Granada o servicios de transfer. Sube en telecabina a la estación y acude al punto de encuentro de Explora School & Club (mapa adjunto).",
                "Sierra Nevada is about 30 km from Granada. You can arrive by car, bus from Granada or transfer services. Take the gondola up to the resort and head to the Explora School & Club meeting point (map below).",
              )}
            </p>
            <p>
              {pickLocale(
                locale,
                "El forfait se adquiere en Plaza de Andalucía (Pradollano) o en sierranevada.es. Si necesitas indicaciones concretas para tu día, escríbenos por email.",
                "Lift passes are purchased at Plaza de Andalucía (Pradollano) or at sierranevada.es. Email us if you need specific directions for your day.",
              )}
            </p>

            <a
              href={site.meetingPoint.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 !w-auto"
            >
              {pickLocale(locale, "Abrir en Google Maps", "Open in Google Maps")}
            </a>
            <a href={`mailto:${site.email}`} className="btn-secondary mt-4 !w-auto">
              {site.email}
            </a>
            <Link href="/clases" className="btn-secondary mt-4 !w-auto">
              {pickLocale(locale, "Elegir clases", "Choose lessons")}
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-hielo/10 shadow-lg sm:rounded-2xl">
              <iframe
                title={pickLocale(
                  locale,
                  `Mapa — ${site.meetingPoint.name}`,
                  `Map — ${site.meetingPoint.name}`,
                )}
                src={mapEmbed}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="text-xs text-hielo/70 sm:text-sm">
              {pickLocale(
                locale,
                `Punto de encuentro oficial: ${site.meetingPoint.name} (estación de esquí de Sierra Nevada).`,
                `Official meeting point: ${site.meetingPoint.name} (Sierra Nevada ski resort).`,
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
