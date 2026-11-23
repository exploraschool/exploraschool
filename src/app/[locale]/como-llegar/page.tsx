import { setRequestLocale } from "next-intl/server";
import { COMO_LLEGAR_AEO } from "@/data/landing-aeo";
import { PageHeader } from "@/components/PageHeader";
import { LandingAnswerBlocks } from "@/components/LandingAnswerBlocks";
import { LandingFaqSection } from "@/components/LandingFaqSection";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { getMeetingPointEmbedUrl } from "@/lib/maps";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/como-llegar",
    title: pickLocale(locale, "Cómo llegar a Sierra Nevada", "Getting to Sierra Nevada"),
    description: pickLocale(
      locale,
      "Cómo llegar a Sierra Nevada y al punto de encuentro de Explora en Borreguiles: telecabina Al-Andalus, parking Plaza de Andalucía, regla de 90 minutos.",
      "How to get to Sierra Nevada and Explora’s meeting point in Borreguiles: Al-Andalus gondola, Plaza de Andalucía parking, 90-minute rule.",
    ),
    ogImage: "/images/stock/gallery-06-gondola.jpg",
    ogImageAlt: pickLocale(
      locale,
      "Subida en telecabina a la estación de Sierra Nevada",
      "Gondola ride up to Sierra Nevada ski resort",
    ),
  });
}

export default async function ComoLlegarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const mapEmbed = getMeetingPointEmbedUrl(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          {
            name: pickLocale(locale, "Cómo llegar", "Getting here"),
            path: "/como-llegar",
          },
        ]}
      />
      <PageHeader
        eyebrow={pickLocale(locale, "Ubicación", "Location")}
        title={pickLocale(locale, "Cómo llegar a Explora en Sierra Nevada", "Getting to Explora in Sierra Nevada")}
        description={pickLocale(locale, COMO_LLEGAR_AEO.leadEs, COMO_LLEGAR_AEO.leadEn)}
      />

      <section className="section-padding">
        <div className="container-page grid grid-gap-lg md:grid-cols-2">
          <div className="prose-page">
            <h2>{pickLocale(locale, "Dirección y NAP", "Address and NAP")}</h2>
            <p>
              {site.meetingPoint.name}
              <br />
              {site.nap.streetAddress}, {site.nap.addressLocality}
              <br />
              {site.nap.addressRegion} {site.nap.postalCode}, {site.nap.addressCountry}
              <br />
              {site.nap.telephone} · {site.nap.email}
            </p>

            <h2>{pickLocale(locale, "Punto de encuentro", "Meeting point")}</h2>
            <p>{pickLocale(locale, site.meetingPointEs, site.meetingPointEn)}</p>
            <a
              href={site.meetingPoint.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 !w-auto"
            >
              {pickLocale(locale, "Abrir punto de encuentro en Google Maps", "Open meeting point in Google Maps")}
            </a>

            <h2>{pickLocale(locale, "Alquiler de material", "Equipment rental")}</h2>
            <p>{pickLocale(locale, site.rentalPartner.howToFindEs, site.rentalPartner.howToFindEn)}</p>
            <a
              href={site.rentalPartner.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 !w-auto"
            >
              {pickLocale(locale, "Cómo llegar al alquiler", "Directions to the rental shop")}
            </a>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${site.email}`} className="btn-secondary !w-auto">
                {site.email}
              </a>
              <Link href="/clases" className="btn-secondary !w-auto">
                {pickLocale(locale, "Elegir clases", "Choose lessons")}
              </Link>
            </div>
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
              {pickLocale(locale, "El pin marca el punto de encuentro.", "The pin is the meeting point.")}
            </p>
          </div>
        </div>
      </section>

      <LandingAnswerBlocks
        locale={locale}
        sections={COMO_LLEGAR_AEO.sections}
        className="section-padding bg-nieve"
      />

      <LandingFaqSection
        locale={locale}
        faqs={COMO_LLEGAR_AEO.faqs}
        links={COMO_LLEGAR_AEO.links}
        className="section-padding bg-white"
      />
    </>
  );
}
