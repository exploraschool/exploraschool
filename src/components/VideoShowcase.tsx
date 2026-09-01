import Image from "next/image";
import { media } from "@/lib/media";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";

type VideoShowcaseProps = {
  locale: string;
};

export function VideoShowcase({ locale }: VideoShowcaseProps) {
  return (
    <section className="section-padding mesh-dark text-nieve overflow-hidden">
      <div className="container-page grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
        <Reveal>
          <div>
            <SectionHeader
              dark
              eyebrow={pickLocale(locale, "En la nieve", "On the snow")}
              title={pickLocale(locale, "Síguenos y mira la acción", "Follow us and see the action")}
              description={pickLocale(
                locale,
                "Clases dinámicas, grupos, niños y perfeccionamiento en Borreguiles. Publicamos vídeos y fotos reales de temporada en Instagram y Facebook.",
                "Dynamic lessons, groups, kids and coaching in Borreguiles. We post real season videos and photos on Instagram and Facebook.",
              )}
            />
            <div className="btn-stack mt-6 sm:mt-8">
              <a
                href={media.video.instagramProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                @explora.school
              </a>
              <a
                href={media.video.facebookPage}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass"
              >
                Facebook
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <a
            href={media.video.instagramProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)]"
          >
            <Image
              src={media.video.poster}
              alt={pickLocale(locale, "Vídeos de Explora School en Instagram", "Explora School videos on Instagram")}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-pizarra/30 transition duration-300 group-hover:bg-pizarra/15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-[0_8px_32px_rgba(232,90,53,0.5)] transition duration-300 group-hover:scale-110 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <svg className="ml-0.5 h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
            <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-pizarra/70 px-2.5 py-1 text-[0.65rem] font-medium text-nieve backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3 sm:text-xs">
              {pickLocale(locale, "Ver en Instagram", "Watch on Instagram")}
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
