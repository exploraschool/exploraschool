import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hielo/10 bg-pizarra text-nieve">
      <div className="container-page section-padding pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-semibold">Explora School & Club</p>
            <p className="mt-2 text-sm text-nieve/70">
              {site.nap.streetAddress}, {site.nap.addressLocality}
              <br />
              {site.nap.addressRegion} {site.nap.postalCode}, {site.nap.addressCountry}
            </p>
            <p className="mt-3 text-sm">
              <a href={`tel:${site.phone}`} className="hover:text-oro">
                {site.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="hover:text-oro">
                {site.email}
              </a>
            </p>
          </div>

          <div>
            <p className="eyebrow text-oro/80">{t("legal")}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/aviso-legal" className="text-nieve/80 hover:text-oro">
                  {t("avisoLegal")}
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="text-nieve/80 hover:text-oro">
                  {t("privacidad")}
                </Link>
              </li>
              <li>
                <Link href="/politica-de-cookies" className="text-nieve/80 hover:text-oro">
                  {t("cookies")}
                </Link>
              </li>
              <li>
                <Link href="/como-llegar" className="text-nieve/80 hover:text-oro">
                  Cómo llegar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-oro/80">Social</p>
            <ul className="mt-4 space-y-2 text-sm">
              {site.social.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nieve/80 hover:text-oro"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-nieve/70">{t("vat")}</p>
            <p className="mt-4 text-xs leading-relaxed text-nieve/50">{t("cetursa")}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-nieve/10 pt-8 text-xs text-nieve/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. {t("rights")}
          </p>
          <p>Desde {site.foundedYear} en Sierra Nevada</p>
        </div>
      </div>
    </footer>
  );
}
