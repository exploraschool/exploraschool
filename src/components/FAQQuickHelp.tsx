import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import type { ReactNode } from "react";

type FAQQuickHelpProps = {
  locale: string;
};

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hielo/8 text-hielo">
      {children}
    </div>
  );
}

export function FAQQuickHelp({ locale }: FAQQuickHelpProps) {
  const channels = [
    {
      titleEs: "Reservar online",
      titleEn: "Book online",
      descEs: "Elige clases, fechas y participantes. Sin pago online.",
      descEn: "Choose lessons, dates and group size. No online payment.",
      href: "/reserva",
      internal: true,
      accent: true,
      ctaEs: "Ir a reservar →",
      ctaEn: "Go to booking →",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      titleEs: "WhatsApp",
      titleEn: "WhatsApp",
      descEs: "La vía más rápida. Reservas de 9:00 a 20:00.",
      descEn: "The fastest option. Booking replies from 9:00 am to 8:00 pm.",
      href: site.whatsappUrl,
      internal: false,
      accent: false,
      ctaEs: "Escribir →",
      ctaEn: "Message us →",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
    {
      titleEs: "Llamar o email",
      titleEn: "Call or email",
      descEs: `${site.phoneDisplay} · ${site.email}`,
      descEn: `${site.phoneDisplay} · ${site.email}`,
      href: `tel:${site.phone}`,
      internal: false,
      accent: false,
      ctaEs: "Llamar →",
      ctaEn: "Call →",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="grid grid-gap sm:grid-cols-3">
      {channels.map((channel) => {
        const className = `card-interactive flex h-full flex-col ${
          channel.accent ? "border-accent/20 bg-gradient-to-br from-accent/5 to-transparent" : ""
        }`;

        const content = (
          <>
            <IconWrap>{channel.icon}</IconWrap>
            <h3 className="mt-4 font-display font-semibold text-hielo">
              {pickLocale(locale, channel.titleEs, channel.titleEn)}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {pickLocale(locale, channel.descEs, channel.descEn)}
            </p>
            <span className="mt-5 inline-flex text-sm font-semibold text-accent">
              {pickLocale(locale, channel.ctaEs, channel.ctaEn)}
            </span>
          </>
        );

        if (channel.internal) {
          return (
            <Link key={channel.titleEs} href={channel.href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <a
            key={channel.titleEs}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={className}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
