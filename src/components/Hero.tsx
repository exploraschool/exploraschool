import Image from "next/image";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

type HeroProps = {
  locale: string;
};

export function Hero({ locale }: HeroProps) {
  const preseason = pickLocale(locale, site.preseasonCopyEs, site.preseasonCopyEn);

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-pizarra text-nieve">
      <Image
        src={media.hero}
        alt={pickLocale(
          locale,
          "Clases de esquí y snowboard en Sierra Nevada con Explora School",
          "Ski and snowboard lessons in Sierra Nevada with Explora School",
        )}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-pizarra/95 via-pizarra/75 to-pizarra/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-pizarra/80 via-transparent to-pizarra/30" />

      <div className="container-page relative flex min-h-[85vh] flex-col justify-center py-20 md:py-28">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow text-oro">{pickLocale(locale, "Sierra Nevada · Granada", "Sierra Nevada · Granada")}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-nieve md:text-6xl lg:text-7xl">
            {pickLocale(
              locale,
              "Clases de esquí, snowboard y telemark en Sierra Nevada",
              "Ski, snowboard and telemark lessons in Sierra Nevada",
            )}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-nieve/85 md:text-xl">
            {pickLocale(
              locale,
              "Instructores con nombre y cara. Desde 2010. Diversión, técnica y un punto de encuentro claro en Borreguiles.",
              "Instructors you can name and recognise. Since 2010. Fun, technique and a clear meeting point in Borreguiles.",
            )}
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-oro/40 bg-oro/10 px-4 py-2 text-sm font-medium text-oro backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-oro" aria-hidden />
            {preseason}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary shadow-lg shadow-accent/25">
              {pickLocale(locale, "Reservar por WhatsApp", "Book via WhatsApp")}
            </a>
            <a href={`/${locale}/clases`} className="btn-secondary border-nieve/25 bg-nieve/10 text-nieve backdrop-blur-sm hover:bg-nieve/20">
              {pickLocale(locale, "Ver clases y precios", "View lessons & prices")}
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-nieve/15 pt-8 text-center sm:gap-8 sm:text-left">
            <div>
              <dt className="text-xs uppercase tracking-wider text-nieve/60">{pickLocale(locale, "Desde", "Since")}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-oro">2010</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-nieve/60">TripAdvisor</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-oro">5,0 ★</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-nieve/60">{pickLocale(locale, "Niños desde", "Kids from")}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-oro">3 {pickLocale(locale, "años", "years")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
