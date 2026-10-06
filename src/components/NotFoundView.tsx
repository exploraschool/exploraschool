import Image from "next/image";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";

const copy = {
  es: {
    title: "Esta página no está disponible",
    description:
      "Esta página no existe. Vuelve al inicio o reserva una clase en Sierra Nevada.",
    lead: "La dirección no existe o ha dejado de publicarse. Puedes volver al inicio o continuar con las clases, las tarifas y el contacto de la escuela.",
    home: "Ir al inicio",
    book: "Reservar",
    continueLabel: "Continuar",
    links: [
      { href: "/clases" as const, label: "Clases", detail: "Esquí, snowboard y telemark" },
      { href: "/tarifas" as const, label: "Tarifas", detail: "Precios de la temporada" },
      {
        href: "/preguntas-frecuentes" as const,
        label: "Preguntas frecuentes",
        detail: "Reservas, forfait y material",
      },
      { href: "/contacto" as const, label: "Contacto", detail: "Teléfono, WhatsApp y correo" },
    ],
  },
  en: {
    title: "This page is not available",
    description: "This page does not exist. Return home or book a lesson in Sierra Nevada.",
    lead: "This address does not exist or is no longer published. You can return home or continue with lessons, rates and the school contact.",
    home: "Back to home",
    book: "Book",
    continueLabel: "Continue",
    links: [
      { href: "/clases" as const, label: "Lessons", detail: "Ski, snowboard and telemark" },
      { href: "/tarifas" as const, label: "Rates", detail: "Season prices" },
      {
        href: "/preguntas-frecuentes" as const,
        label: "FAQs",
        detail: "Bookings, lift passes and gear",
      },
      { href: "/contacto" as const, label: "Contact", detail: "Phone, WhatsApp and email" },
    ],
  },
};

export async function notFoundPageMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = pickLocale(locale, copy.es, copy.en);

  return {
    title: { absolute: `${text.title} | ${site.name}` },
    description: text.description,
    robots: { index: false, follow: true },
    alternates: { canonical: null },
  };
}

export async function NotFoundView() {
  const locale = await getLocale();
  const text = pickLocale(locale, copy.es, copy.en);

  return (
    <>
      <section className="relative overflow-hidden bg-pizarra text-nieve">
        <Image
          src={media.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pizarra/92 via-pizarra/70 to-hielo/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-pizarra/85 via-pizarra/20 to-pizarra/40" />

        <div className="container-page relative grid py-12 sm:py-16 lg:min-h-[26rem] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10 lg:py-20 xl:grid-cols-[minmax(0,36rem)_auto] xl:gap-16">
          <p
            className="pointer-events-none hidden select-none font-display font-semibold leading-none tracking-tight text-nieve lg:col-start-2 lg:row-start-1 lg:block lg:text-right lg:text-[5.5rem] xl:text-[8.25rem]"
            aria-hidden
          >
            404
            <span className="mt-4 hidden h-1 w-12 rounded-full bg-accent lg:ml-auto lg:block" />
          </p>

          <div className="relative z-[1] max-w-xl animate-fade-up lg:col-start-1 lg:row-start-1">
            <p className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-oro-light" aria-hidden />
              Error 404 · Sierra Nevada
            </p>
            <h1 className="mt-5 font-display text-[1.85rem] font-semibold leading-[1.15] text-nieve sm:text-4xl lg:text-[2.6rem]">
              {text.title}
            </h1>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-nieve/85 sm:text-base">
              {text.lead}
            </p>
            <div className="btn-stack mt-7">
              <Link href="/" className="btn-primary">
                {text.home}
              </Link>
              <Link href="/reserva" className="btn-glass">
                {text.book}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding-sm bg-nieve">
        <div className="container-page">
          <h2 id="not-found-continue" className="eyebrow">
            {text.continueLabel}
          </h2>
          <nav aria-labelledby="not-found-continue" className="mt-4 sm:mt-5">
            <ul className="grid gap-3 sm:grid-cols-2">
              {text.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="card-interactive group flex items-center justify-between gap-4"
                  >
                    <span className="min-w-0">
                      <span className="block font-display text-lg font-semibold text-pizarra">
                        {link.label}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">
                        {link.detail}
                      </span>
                    </span>
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hielo/15 text-hielo transition duration-300 group-hover:border-hielo group-hover:bg-hielo group-hover:text-white"
                      aria-hidden
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
