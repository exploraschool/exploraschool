import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type ContactInfoPanelProps = {
  locale: string;
  bookingTitle: string;
  bookingDesc: string;
  emailTitle: string;
  hoursTitle: string;
};

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hielo/8 text-hielo">
      {children}
    </div>
  );
}

export function ContactInfoPanel({
  locale,
  bookingTitle,
  bookingDesc,
  emailTitle,
  hoursTitle,
}: ContactInfoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex gap-4">
          <IconWrap>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </IconWrap>
          <div>
            <h2 className="font-display text-lg font-semibold text-hielo">{bookingTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{bookingDesc}</p>
            <Link href="/reserva" className="btn-primary mt-4 !w-auto">
              {pickLocale(locale, "Ir a mi reserva", "Go to my booking")}
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4">
          <IconWrap>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </IconWrap>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-hielo">
              {pickLocale(locale, "Habla con nosotros", "Talk to us")}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {pickLocale(
                locale,
                "La forma más rápida de resolver dudas o gestionar tu reserva.",
                "The fastest way to ask questions or manage your booking.",
              )}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !w-auto text-center"
              >
                WhatsApp
              </a>
              <a href={`tel:${site.phone}`} className="btn-secondary !w-auto text-center">
                {site.phoneDisplay}
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">
              {hoursTitle}: {site.openingHours}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="card">
          <div className="flex gap-3">
            <IconWrap>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </IconWrap>
            <div>
              <h2 className="font-display font-semibold text-hielo">{emailTitle}</h2>
              <a href={`mailto:${site.email}`} className="mt-1 block text-sm font-medium text-accent hover:underline">
                {site.email}
              </a>
              <p className="mt-2 text-sm text-muted">
                {pickLocale(locale, "Para reservas, consultas y confirmaciones.", "For bookings, enquiries and confirmations.")}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex gap-3">
            <IconWrap>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </IconWrap>
            <div>
              <h2 className="font-display font-semibold text-hielo">
                {pickLocale(locale, "Ubicación", "Location")}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {site.nap.addressLocality}, {site.nap.addressRegion}
              </p>
              <div className="mt-3">
                <Link
                  href="/como-llegar"
                  className="text-sm font-semibold text-hielo hover:text-accent"
                >
                  {pickLocale(locale, "Cómo llegar →", "Getting here →")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
