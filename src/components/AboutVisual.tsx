import Image from "next/image";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import { site } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";

type AboutVisualProps = {
  locale: string;
  compact?: boolean;
};

export function AboutVisual({ locale, compact = false }: AboutVisualProps) {
  return (
    <section className={`bg-white ${compact ? "section-padding-sm" : "section-padding"}`}>
      <div className="container-page grid items-center grid-gap-lg md:grid-cols-2">
        <Reveal>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[5/4]">
            <Image
              src={media.gallery[0].src}
              alt={pickLocale(locale, media.gallery[0].altEs, media.gallery[0].altEn)}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pizarra/40 to-transparent" />
            <div className="absolute bottom-3 left-3 rounded-lg bg-pizarra/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              Estación de esquí · Sierra Nevada
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <SectionHeader
              eyebrow={pickLocale(locale, "Explora School & Club", "Explora School & Club")}
              title={pickLocale(locale, "Tu escuela en Sierra Nevada", "Your school in Sierra Nevada")}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              {pickLocale(locale, site.aboutLeadEs, site.aboutLeadEn)}
            </p>
            <div className="mt-5">
              <Link href="/como-llegar" className="btn-secondary !w-auto text-sm">
                {pickLocale(locale, "Cómo llegar", "How to get here")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
