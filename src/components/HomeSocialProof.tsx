import Image from "next/image";
import { media } from "@/lib/media";
import { Reveal } from "@/components/Reveal";
import { LiveGalleryCarousel } from "@/components/LiveGalleryCarousel";
import { SierraNevadaWeatherBanner } from "@/components/SierraNevadaWeatherBanner";
import { pickLocale } from "@/lib/locale";
import { getLiveGalleryForHome } from "@/lib/live-gallery";
import { getSierraNevadaWeather } from "@/lib/sierra-nevada-weather";

function InstagramGlyph({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="0.3" cy="1.1" r="1.2">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${id})`} />
      <circle cx="12" cy="12" r="4.35" fill="none" stroke="#fff" strokeWidth="1.85" />
      <circle cx="17.35" cy="6.65" r="1.15" fill="#fff" />
    </svg>
  );
}

type HomeSocialProofProps = {
  locale: string;
};

export async function HomeSocialProof({ locale }: HomeSocialProofProps) {
  const [gallery, weather] = await Promise.all([
    getLiveGalleryForHome(),
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
                  <InstagramGlyph id="explora-ig-mark" className="h-14 w-14" />
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
                aria-label={pickLocale(
                  locale,
                  "Abrir el perfil de Instagram @explora.school",
                  "Open the Instagram profile @explora.school",
                )}
                className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-4 text-nieve backdrop-blur-sm transition hover:border-white/30 hover:bg-white/16 sm:mt-6"
              >
                <InstagramGlyph id="explora-ig-follow" className="h-8 w-8 shrink-0" />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-sm font-semibold">Instagram</span>
                  <span className="text-[0.7rem] font-medium text-nieve/70">@explora.school</span>
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
