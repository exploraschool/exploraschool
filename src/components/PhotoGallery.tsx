import Image from "next/image";
import { media } from "@/lib/media";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";

type PhotoGalleryProps = {
  locale: string;
};

export function PhotoGallery({ locale }: PhotoGalleryProps) {
  return (
    <section className="section-padding ski-pattern bg-nieve">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow={pickLocale(locale, "Galería", "Gallery")}
              title={pickLocale(locale, "Sierra Nevada, en directo", "Sierra Nevada, up close")}
              description={pickLocale(
                locale,
                "Esquí, snowboard y montaña en Sierra Nevada. Síguenos en Instagram para ver fotos reales de temporada.",
                "Ski, snowboard and mountain life in Sierra Nevada. Follow us on Instagram for real season photos.",
              )}
            />
            <a
              href={media.video.instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary shrink-0 !w-auto"
            >
              @explora.school
            </a>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-4 lg:gap-5">
          {media.gallery.map((item, i) => (
            <Reveal key={item.src} delay={i * 70}>
              <figure
                className={`group image-shine relative overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(10,18,25,0.08)] ${
                  i === 0
                    ? "col-span-2 aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[280px] lg:min-h-[320px]"
                    : "aspect-square sm:aspect-[4/3]"
                }`}
              >
                <Image
                  src={item.src}
                  alt={pickLocale(locale, item.altEs, item.altEn)}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes={
                    i === 0
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 640px) 50vw, 25vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pizarra/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {i === 0 && (
                  <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-pizarra/60 px-3 py-1 text-xs font-medium text-nieve backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4 sm:left-4">
                    {pickLocale(locale, "Ver en Instagram", "View on Instagram")}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
