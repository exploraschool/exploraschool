import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { media } from "@/lib/media";
import { site } from "@/data/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();

  const siteLinks = [
    { href: "/clases", label: nav("clases") },
    { href: "/club", label: nav("club") },
    { href: "/blog", label: nav("blog") },
    { href: "/preguntas-frecuentes", label: nav("faqs") },
    { href: "/contacto", label: nav("contacto") },
  ] as const;

  return (
    <footer className="relative border-t border-white/10 bg-pizarra text-nieve">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-oro/40 to-transparent" aria-hidden />

      <div className="container-page py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <Image
                src={media.logo}
                alt="Explora School & Club"
                width={160}
                height={160}
                className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] sm:h-20 sm:w-20"
              />
              <div>
                <p className="font-display text-lg font-semibold leading-tight sm:text-xl">
                  Explora School & Club
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-oro-light">Sierra Nevada</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-nieve/85">
              {site.nap.streetAddress}, {site.nap.addressLocality}
              <br />
              {site.nap.addressRegion} {site.nap.postalCode}, {site.nap.addressCountry}
            </p>
            <p className="mt-3 text-sm text-nieve/90">
              <a href={`tel:${site.phone}`} className="transition hover:text-oro-light">
                {site.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="transition hover:text-oro-light">
                {site.email}
              </a>
            </p>
          </div>

          <div>
            <p className="eyebrow-dark">{t("explora")}</p>
            <ul className="mt-3 space-y-2 text-sm sm:mt-4">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-nieve/85 transition hover:text-oro-light hover:pl-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow-dark">{t("legal")}</p>
            <ul className="mt-3 space-y-2 text-sm sm:mt-4">
              {[
                { href: "/aviso-legal", label: t("avisoLegal") },
                { href: "/politica-de-privacidad", label: t("privacidad") },
                { href: "/politica-de-cookies", label: t("cookies") },
                { href: "/como-llegar", label: t("comoLlegar") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-nieve/85 transition hover:text-oro-light hover:pl-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow-dark">{t("social")}</p>
            <ul className="mt-3 space-y-2 text-sm sm:mt-4">
              {site.social.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nieve/85 transition hover:text-oro-light hover:pl-1"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-nieve/80">{t("vat")}</p>
            <p className="mt-3 text-xs leading-relaxed text-nieve/65 sm:mt-4">{t("cetursa")}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/8 pt-6 text-xs text-nieve/65 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p>
            © {year} {site.legalName}. {t("rights")}
          </p>
          <p>{t("since", { year: site.foundedYear })}</p>
        </div>
      </div>
    </footer>
  );
}
