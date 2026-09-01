import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type CTASectionProps = {
  locale: string;
};

export function CTASection({ locale }: CTASectionProps) {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-pizarra px-8 py-12 text-nieve md:px-16 md:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-oro">{pickLocale(locale, "Reservas", "Bookings")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(
                locale,
                "Reserva tus clases con antelación",
                "Book your lessons in advance",
              )}
            </h2>
            <p className="mt-4 text-nieve/75">
              {pickLocale(
                locale,
                "Todos los precios tienen el IVA incluido. Elige a tu instructor/a en el horario que más se adapte a tus necesidades.",
                "All prices include VAT. Choose your instructor and the schedule that suits you best.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {pickLocale(locale, "Reservar por WhatsApp", "Book via WhatsApp")}
              </a>
              <Link href="/contacto" className="btn-secondary border-nieve/20 bg-transparent text-nieve hover:bg-nieve/10">
                {pickLocale(locale, "Formulario de contacto", "Contact form")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
