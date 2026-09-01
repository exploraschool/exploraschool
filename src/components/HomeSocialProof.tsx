import Image from "next/image";
import { media } from "@/lib/media";
import { Reveal } from "@/components/Reveal";
import { pickLocale } from "@/lib/locale";

type HomeSocialProofProps = {
  locale: string;
};

export function HomeSocialProof({ locale }: HomeSocialProofProps) {
  const gallery = media.gallery.slice(0, 4);

  return (
    <section className="section-padding-sm mesh-dark overflow-hidden text-nieve">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10">
          <Reveal>
            <a
              href={media.video.instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-video overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={media.video.poster}
                alt={pickLocale(locale, "Explora School en Instagram", "Explora School on Instagram")}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-pizarra/25 transition group-hover:bg-pizarra/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg transition group-hover:scale-110">
                  <svg className="ml-0.5 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </a>
          </Reveal>

          <div>
            <Reveal delay={80}>
              <p className="eyebrow-dark">
                {pickLocale(locale, "En la nieve", "On the snow")}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-nieve sm:text-3xl">
                {pickLocale(locale, "La estación, en directo", "The resort, live")}
              </h2>
              <p className="mt-2 text-sm text-on-dark-muted">
                {pickLocale(
                  locale,
          "Pistas de Borreguiles, Sierra Nevada (Granada). Síguenos en Instagram.",
          "Borreguiles slopes, Sierra Nevada (Granada). Follow us on Instagram.",
                )}
              </p>
            </Reveal>

            <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {gallery.map((item, i) => (
                <Reveal key={item.src} delay={100 + i * 50}>
                  <figure className="relative aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={item.src}
                      alt={pickLocale(locale, item.altEs, item.altEn)}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </figure>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <a
                href={media.video.instagramProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-oro-light hover:underline"
              >
                @explora.school →
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </secti