import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type FAQQuickHelpProps = {
  locale: string;
};

export function FAQQuickHelp({ locale }: FAQQuickHelpProps) {
  const channels = [
    {
      titleEs: "Reservar online",
      titleEn: "Book online",
      descEs: "Elige clases, fechas y participantes en pocos pasos.",
      descEn: "Choose lessons, dates and group size in a few steps.",
      href: "/reserva",
      internal: true,
      accent: true,
    },
    {
      titleEs: "WhatsApp",
      titleEn: "WhatsApp",
      descEs: "Respuesta rápida en horario de estación.",
      descEn: "Quick reply during resort hours.",
      href: site.whatsappUrl,
      internal: false,
      accent: false,
    },
    {
      titleEs: "Email",
      titleEn: "Email",
      descEs: site.email,
      descEn: site.email,
      href: `mailto:${site.email}`,
      internal: false,
      accent: false,
    },
  ] as const;

  return (
    <div className="grid grid-gap sm:grid-cols-3">
      {channels.map((channel) => {
        const className = `flex h-full flex-col rounded-2xl border p-5 transition hover:shadow-[0_8px_24px_rgba(10,18,25,0.06)] ${
          channel.accent
            ? "border-accent/20 bg-gradient-to-br from-accent/5 to-transparent"
            : "border-hielo/10 bg-white hover:border-hielo/20"
        }`;

        const content = (
          <>
            <h3 className="font-display font-semibold text-hielo">
              {pickLocale(locale, channel.titleEs, channel.titleEn)}
            </h3>
            <p className="mt-3 flex-1 text-sm text-muted">
              {pickLocale(locale, channel.descEs, channel.descEn)}
            </p>
            <span className="mt-5 inline-flex text-sm font-semibold text-accent">
              {pickLocale(locale, "Ir →", "Go →")}
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
            target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={channel.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className={className}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
