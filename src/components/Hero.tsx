import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type HeroProps = {
  locale: string;
};

export function Hero({ locale }: HeroProps) {
  const preseason = pickLocale(locale, site.preseasonCopyEs, site.preseasonCopyEn);

  return (
    <section className="relative overflow-hidden bg-pizarra text-nieve">
      <div className="absolute inset-0 ski-pattern opacity-30" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-hielo/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-page relative py-20 md:py-32">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow text-oro">{pickLocale(locale, "Sierra Nevada", "Sierra Nevada")}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-nieve md:text-6xl">
            {pickLocale(
              locale,
              "Clases de esquí, snowboard y telemark en Sierra Nevada",
              "Ski, snowboard and telemark lessons in Sierra Nevada",
            )}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-nieve/80 md:text-xl">
            {pickLocale(
              locale,
              "Instructores con nombre y cara. Desde 2010. Diversión, técnica y un punto de encuentro claro en Borreguiles.",
              "Instructors you can name and recognise. Since 2010. Fun, technique and a clear meeting point in Borreguiles.",
            )}
          </p>

          <div className="mt-8 inline-block rounded-lg border border-oro/30 bg-oro/10 px-4 py-2 text-sm font-medium text-oro">
            {preseason}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {pickLocale(locale, "Reservar por WhatsApp", "Book via WhatsApp")}
            </a>
            <Link href="/clases" className="btn-secondary border-nieve/20 bg-transparent text-nieve hover:bg-nieve/10">
              {pickLocale(locale, "Ver clases y tarifas", "View lessons & prices")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
