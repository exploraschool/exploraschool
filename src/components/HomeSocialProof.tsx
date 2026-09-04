import Image from "next/image";
import { media } from "@/lib/media";
import { Reveal } from "@/components/Reveal";
import { LiveGalleryCarousel } from "@/components/LiveGalleryCarousel";
import { SierraNevadaWeatherBanner } from "@/components/SierraNevadaWeatherBanner";
import { pickLocale } from "@/lib/locale";
import { getLiveGalleryForHome } from "@/lib/live-gallery";
import { getSierraNevadaWeather } from "@/lib/sierra-nevada-weather";

type HomeSocialProofProps = {
  locale: string;
};

export async function HomeSocialProof({ locale }: HomeSocialProofProps) {
  const [gallery, weather] = await Promise.all([
    getLiveGalleryForHome(12),
    getSierraNevadaWeather(),
  ]);

  return (
    <section className="section-padding-sm mesh-dark overflow-hidden text-nieve">
      <div className="container-page">
        <SierraNevadaWeatherBanner locale={locale} weather={weather} />

        <div className="grid grid-gap-lg lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <a
              href={media.video.instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={pickLocale(
                locale,
                "Ver vídeos de Explora School en Instagram",
                "Watch Explora School videos on Instagram",
              )}
              className="group relative block overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={media.video.poster}
                alt={pickLocale(locale, "Explora School en Instagram", "Explora School on Instagram")}
                width={1280}
                height={720}
                className="aspect-video h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-pizarra/20 transition group-hover:bg-pizarra/10" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center drop-shadow-lg transition group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-14 w-14" aria-hidden>
                    <defs>
                      <radialGradient id="explora-ig-mark" cx="0.3" cy="1.1" r="1.2">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="45%" stopColor="#fd5949" />
                        <stop offset="60%" stopColor="#d6249f" />
                        <stop offset="90%" stopColor="#285AEB" />
                      </radialGradient>
                    </defs>
                    <rect width="24" height="24" rx="6" fill="url(#explora-ig-mark)" />
                    <circle cx="12" cy="12" r="4.35" fill="none" stroke="#fff" strokeWidth="1.85" />
                    <circle cx="17.35" cy="6.65" r="1.15" fill="#fff" />
                  </svg>
                </span>
              </div>
            </a>
          </Reveal>

          <div className="min-w-0">
            <Reveal delay={80}>
              <p className="eyebrow-dark">{pickLocale(locale, "En la nieve", "On the snow")}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-nieve sm:text-3xl">
                {pickLocale(locale, "La estación, en directo", "The resort, live")}
              </h2>
              <p className="mt-3 text-sm text-on-dark-muted">
                {pickLocale(
                  locale,
                  "Pistas de la estación de esquí de Sierra Nevada (Granada). Síguenos en Instagram.",
                  "Sierra Nevada ski resort slopes (Granada). Follow us on Instagram.",
                )}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <LiveGalleryCarousel locale={locale} photos={gallery} />
            </Reveal>

            <Reveal delay={200}>
              <a
                href={media.video.instagramProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex text-sm font-semibold text-oro-light hover:underline sm:mt-8"
              >
                @explora.school →
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
