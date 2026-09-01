import Image from "next/image";
import { Link } from "@/i18n/routing";
import { HeroQuickBook } from "@/components/HeroQuickBook";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { isEarlyBirdActive } from "@/lib/promotions";
import { site } from "@/data/site";

type HeroProps = {
  locale: string;
};

export function Hero({ locale }: HeroProps) {
  const preseason = pickLocale(locale, site.preseasonCopyEs, site.preseasonCopyEn);
  const showEarlyBird = isEarlyBirdActive();

  return (
    <section className="relative min-h-[68svh] overflow-hidden bg-pizarra text-nieve sm:min-h-[72svh] lg:min-h-[76vh]">
      <Image
        src={media.hero}
        alt={pickLocale(
          locale,
          "Esquí en la estación de Sierra Nevada (Granada)",
          "Skiing at Sierra Nevada ski resort (Granada)",
        )}
        fill
        priority
        className="object-cover object-[center_30%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-pizarra/90 via-pizarra/60 to-hielo/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-pizarra/80 via-transparent to-transparent" />

      <div className="container-page relative flex min-h-[68svh] flex-col justify-center py-14 sm:min-h-[72svh] sm:py-16 lg:min-h-[76vh] lg:py-20">
        <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-oro-light" aria-hidden />
              Sierra Nevada · Granada
            </p>

            <h1 className="mt-4 font-display text-[1.75rem] font-semibold leading-[1.1] text-nieve sm:mt-5 sm:text-3xl md:text-[2.5rem] lg:text-4xl">
              {pickLocale(locale, "Clases de ", "Ski, snowboard & ")}
              <span className="text-oro-light">
                {pickLocale(locale, "esquí y snowboard", "lessons")}
              </span>
              {pickLocale(locale, " en Sierra Nevada", " in Sierra Nevada")}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-nieve/90 sm:mt-4 sm:text-base">
              {pickLocale(locale, site.heroLeadEs, site.heroLeadEn)}
            </p>

            {showEarlyBird && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-nieve/85">
                <span className="h-1.5 w-1.5 rounded-full bg-oro" aria-hidden />
                {preseason}
              </p>
            )}

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
