import Image from "next/image";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

type VideoShowcaseProps = {
  locale: string;
};

export function VideoShowcase({ locale }: VideoShowcaseProps) {
  return (
    <section className="section-padding bg-pizarra text-nieve">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow text-oro">{pickLocale(locale, "En la nieve", "On the snow")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Síguenos y mira la acción", "Follow us and see the action")}
          </h2>
          <p className="mt-4 text-nieve/75 leading-relaxed">
            {pickLocale(
              locale,
              "Clases dinámicas, grupos, niños y perfeccionamiento en Borreguiles. Publicamos vídeos y fotos reales de temporada en Instagram y Facebook.",
              "Dynamic lessons, groups, kids and coaching in Borreguiles. We post real season videos and photos on Instagram and Facebook.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
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
              className="btn-secondary border-nieve/20 bg-transparent text-nieve hover:bg-nieve/10"
            >
              Facebook
            </a>
          </div>
        </div>

        <a
          href={media.video.instagramProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden rounded-2xl border border-nieve/10 shadow-2xl"
        >
          <Image
            src={media.video.poster}
            alt={pickLocale(locale, "Vídeos de Explora School en Instagram", "Explora School videos on Instagram")}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-pizarra/30 transition group-hover:bg-pizarra/20">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-lg transition group-hover:scale-110">
              <svg className="ml-1 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
          <span className="absolute bottom-4 left-4 rounded-full bg-pizarra/80 px-3 py-1 text-xs font-medium text-nieve backdrop-blur">
            {pickLocale(locale, "Ver en Instagram", "Watch on Instagram")}
          </span>
        </a>
      </div>
    </section>
  );
}
