import Image from "next/image";
import { pickLocale } from "@/lib/locale";

type PageHeroProps = {
  locale: string;
  eyebrow?: string;
  title: string;
  description?: string;
  imageSrc: string;
  imageAltEs: string;
  imageAltEn: string;
};

export function PageHero({
  locale,
  eyebrow,
  title,
  description,
  imageSrc,
  imageAltEs,
  imageAltEn,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-pizarra text-nieve">
      <Image
        src={imageSrc}
        alt={pickLocale(locale, imageAltEs, imageAltEn)}
        fill
        priority
        className="object-cover object-[center_42%] sm:object-[center_48%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-pizarra/80 via-pizarra/45 to-hielo/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-pizarra/70 via-pizarra/20 to-pizarra/30" />

      <div className="container-page relative py-8 sm:py-11 md:py-14">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow ? (
            <p className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-oro-light" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`text-balance font-display text-[1.5rem] font-semibold leading-[1.15] text-nieve sm:text-3xl md:text-[2.25rem] lg:text-4xl ${eyebrow ? "mt-3 sm:mt-4" : ""}`}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-nieve/90 sm:mt-3 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
