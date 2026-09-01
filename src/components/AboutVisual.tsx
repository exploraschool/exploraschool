import Image from "next/image";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

type AboutVisualProps = {
  locale: string;
};

export function AboutVisual({ locale }: AboutVisualProps) {
  return (
    <section className="section-padding bg-white">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[420px]">
          <Image
            src={media.gallery[0].src}
            alt={pickLocale(locale, media.gallery[0].altEs, media.gallery[0].altEn)}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="eyebrow">{pickLocale(locale, "¿Quiénes somos?", "Who we are")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Experiencia única en la nieve", "A unique experience on the snow")}
          </h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            <p>
              {pickLocale(
                locale,
                "Explora School & Club es una agrupación de instructores/as, fundada en 2010 para ofrecerte una experiencia única en la enseñanza de los deportes de invierno en Sierra Nevada.",
                "Explora School & Club is a group of instructors founded in 2010 to offer you a unique experience teaching winter sports in Sierra Nevada.",
              )}
            </p>
            <p>
              {pickLocale(
                locale,
                "Queremos dar accesibilidad a la contratación de clases y garantizar un entorno seguro. La diversión y el aprendizaje están garantizados.",
                "We want to make booking lessons accessible and guarantee a safe environment. Fun and learning are assured.",
              )}
            </p>
            <p>
              {pickLocale(
                locale,
                site.meetingPointEs,
                site.meetingPointEn,
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
