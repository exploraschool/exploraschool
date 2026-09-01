import Image from "next/image";
import { Link } from "@/i18n/routing";
import { HeroQuickBook } from "@/components/HeroQuickBook";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

type HeroProps = {
  locale: string;
};

export function Hero({ locale }: HeroProps) {
  const preseason = pickLocale(locale, site.preseasonCopyEs, site.preseasonCopyEn);

  return (
    <section className="relative min-h-[78svh] overflow-hidden bg-pizarra text-nieve sm:min-h-[82svh] lg:min-h-[86vh]">
      <Image
        src={media.hero}
        alt={pickLocale(
          locale,
          "Esquí en Borreguiles, Sierra Nevada (Granada)",
          "Skiing in Borreguiles, Sierra Nevada (Granada)",
        )}
        fill
        priority
        className="object-cover object-[center_30%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-pizarra/90 via-pizarra/60 to-hielo/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-pizarra/80 via-transparent to-transparent" />

      <div className="container-page relative flex min-h-[78svh] flex-col justify-center py-16 sm:min-h-[82svh] sm:py-20 lg:min-h-[86vh] lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-oro-light" aria-hidden />
              Sierra Nevada · Granada
            </p>

            <h1 className="mt-4 font-display text-[1.85rem] font-semibold leading-[1.08] text-nieve sm:mt-5 sm:text-4xl md:text-[2.75rem] lg:text-5xl">
              {pickLocale(locale, "Clases de ", "Ski, snowboard & ")}
              <span className="text-oro-light">
                {pickLocale(locale, "esquí y snowboard", "lessons")}
              </span>
              {pickLocale(locale, " en Sierra Nevada", " in Sierra Nevada")}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-nieve/90 sm:text-lg">
              {pickLocale(
                locale,
                "Instructores titulados desde 2010. Reserva online en minutos.",
                "Qualified instructors since 2010. Book online in minutes.",
              )}
            </p>

            <p className="mt-4 inline-flex items-center gap-2 text-sm text-nieve/85">
              <span className="h-1.5 w-1.5 rounded-full bg-oro" aria-hidden />
              {preseason}
            </p>

            <div className="btn-stack mt-6 sm:mt-7">
              <Link href="/clases" className="btn-primary">
                {pickLocale(locale, "Elegir clases", "Choose lessons")}
              </Link>
              <Link href="/reserva" className="btn-glass">
                {pickLocale(locale, "Mi reserva", "My booking")}
              </Link>
            </div>
          </div>

          <div className="animate-fade-up lg:justify-self-end" style={{ animationDelay: "0.1s" }}>
            <HeroQuickBook locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
