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
    <section className="relative min-h-[36svh] overflow-hidden bg-pizarra text-nieve sm:min-h-[40svh] lg:min-h-[42vh]">
      <Image
        src={imageSrc}
        alt={pickLocale(locale, imageAltEs, imageAltEn)}
        fill
        priority
        className="object-cover object-[center_58%] sm:object-[center_52%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-pizarra/88 via-pizarra/50 to-hielo/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-pizarra/85 via-pizarra/25 to-pizarra/40 sm:from-pizarra/75 sm:via-pizarra/15 sm:to-pizarra/30" />

      <div className="container-page relative flex min-h-[36svh] flex-col justify-end py-8 sm:min-h-[40svh] sm:justify-center sm:py-12 lg:min-h-[42vh] lg:py-14">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow ? (
            <p className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-oro-light" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`font-display text-[1.65rem] font-semibold leading-[1.12] text-nieve sm:text-3xl md:text-[2.25rem] lg:text-4xl ${eyebrow ? "mt-3 sm:mt-4" : ""}`}
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
