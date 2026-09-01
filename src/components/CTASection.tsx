import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

type CTASectionProps = {
  locale: string;
  /** En páginas de clases el CTA principal lleva al carrito, no al listado */
  onClassesPage?: boolean;
};

const reassurances = [
  {
    textEs: "Sin pago online",
    textEn: "No online payment",
  },
  {
    textEs: "Confirmación por email",
    textEn: "Email confirmation",
  },
  {
    textEs: "IVA incluido",
    textEn: "VAT included",
  },
];

export function CTASection({ locale, onClassesPage = false }: CTASectionProps) {
  return (
    <section className="section-padding">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl mesh-dark px-5 py-10 text-nieve sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/25 blur-[80px] animate-pulse-glow" aria-hidden />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-frost/15 blur-[60px]" aria-hidden />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-12">
              <div>
                <SectionHeader
                  dark
                  eyebrow={pickLocale(locale, "Reservas", "Bookings")}
                  title={pickLocale(locale, "Reserva tus clases con antelación", "Book your lessons in advance")}
                  description={pickLocale(
                    locale,
                    "Elige productos, fechas y número de personas. Tu reserva llegará a nuestro email listo para confirmar.",
                    "Choose products, dates and group size. Your booking arrives in our inbox ready to confirm.",
                  )}
                />
                <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                  {reassurances.map((r) => (
                    <li
                      key={r.textEs}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-on-dark"
                    >
                      <svg className="h-3.5 w-3.5 text-oro" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {pickLocale(locale, r.textEs, r.textEn)}
                    </li>
                  ))}
                </ul>
                <div className="btn-stack mt-6 sm:mt-8">
                  {onClassesPage ? (
                    <Link href="/reserva" className="btn-primary">
                      {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
                    </Link>
                  ) : (
                    <>
                      <Link href="/clases" className="btn-primary">
                        {pickLocale(locale, "Elegir clases", "Choose lessons")}
                      </Link>
                      <Link href="/reserva" className="btn-glass">
                        {pickLocale(locale, "Mi reserva", "My booking")}
                      </Link>
                    </>
                  )}
                  <Link href="/contacto" className={onClassesPage ? "btn-glass" : "btn-secondary"}>
                    {pickLocale(locale, "Contactar por email", "Contact by email")}
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
                <p className="eyebrow-dark">
                  {pickLocale(locale, "¿Prefieres hablar?", "Prefer to talk?")}
                </p>
                <p className="mt-2 text-sm text-on-dark-muted">
                  {pickLocale(
                    locale,
                    "Escríbenos por WhatsApp o llámanos. Respondemos en horario de estación.",
                    "Message us on WhatsApp or call. We reply during resort hours.",
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={site.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-nieve transition hover:bg-white/15"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${site.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-nieve transition hover:bg-white/15"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    {site.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
