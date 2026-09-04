import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { Link } from "@/i18n/routing";
import { CookieConsentControls } from "@/components/CookieConsentControls";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/politica-de-cookies",
    title: pickLocale(locale, "Política de cookies", "Cookie policy"),
    description: pickLocale(
      locale,
      `Política de cookies de ${site.name}. Cookies esenciales, sesión y Google Analytics.`,
      `Cookie policy for ${site.name}. Essential cookies, session cookies and Google Analytics.`,
    ),
  });
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl prose-page">
        <h1>{pickLocale(locale, "Política de cookies", "Cookie policy")}</h1>
        <p className="text-sm text-muted">
          {pickLocale(locale, "Última actualización: 4 de septiembre de 2026.", "Last updated: 4 September 2026.")}
        </p>

        <p>
          {pickLocale(
            locale,
            "Este sitio usa cookies y almacenamiento local. Las esenciales hacen funcionar el idioma, la reserva y el inicio de sesión. Google Analytics 4 solo se carga si aceptas la analítica.",
            "This site uses cookies and local storage. Essential ones make language, booking and sign-in work. Google Analytics 4 loads only if you accept analytics.",
          )}
        </p>

        <h2>{pickLocale(locale, "Tu elección", "Your choice")}</h2>
        <p>
          {pickLocale(
            locale,
            "Puedes aceptar la analítica o quedarte solo con lo esencial. El aviso no trata “cerrar” como un sí a Analytics.",
            "You can accept analytics or keep essential cookies only. Dismissing the banner is not treated as a yes to Analytics.",
          )}
        </p>
        <CookieConsentControls />

        <h2>{pickLocale(locale, "Cookies y almacenamiento", "Cookies and storage")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{pickLocale(locale, "Nombre", "Name")}</th>
                <th>{pickLocale(locale, "Tipo", "Type")}</th>
                <th>{pickLocale(locale, "Finalidad", "Purpose")}</th>
                <th>{pickLocale(locale, "Duración", "Duration")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>explora_cookies_accepted</td>
                <td>localStorage</td>
                <td>
                  {pickLocale(
                    locale,
                    "Recuerda si aceptaste o rechazaste la analítica.",
                    "Remembers whether you accepted or rejected analytics.",
                  )}
                </td>
                <td>{pickLocale(locale, "Hasta que lo borres", "Until you clear it")}</td>
              </tr>
              <tr>
                <td>NEXT_LOCALE / preferencia de idioma</td>
                <td>{pickLocale(locale, "Esencial", "Essential")}</td>
                <td>
                  {pickLocale(locale, "Mantener el idioma (es / en).", "Keep the language (es / en).")}
                </td>
                <td>{pickLocale(locale, "Sesión / persistente", "Session / persistent")}</td>
              </tr>
              <tr>
                <td>explora_cart_v2</td>
                <td>localStorage</td>
                <td>
                  {pickLocale(
                    locale,
                    "Guarda las clases de tu reserva mientras navegas.",
                    "Stores lessons in your booking while you browse.",
                  )}
                </td>
                <td>{pickLocale(locale, "Hasta que vacíes el carrito o lo borres", "Until you empty the cart or clear it")}</td>
              </tr>
              <tr>
                <td>explora_student_session</td>
                <td>{pickLocale(locale, "Esencial (httpOnly)", "Essential (httpOnly)")}</td>
                <td>
                  {pickLocale(
                    locale,
                    "Sesión del área de alumnos tras iniciar con Google.",
                    "Student-area session after Google sign-in.",
                  )}
                </td>
                <td>{pickLocale(locale, "5 días", "5 days")}</td>
              </tr>
              <tr>
                <td>explora_admin_session</td>
                <td>{pickLocale(locale, "Esencial (equipo)", "Essential (staff)")}</td>
                <td>
                  {pickLocale(
                    locale,
                    "Sesión del panel interno del equipo Explora.",
                    "Session for the internal Explora staff panel.",
                  )}
                </td>
                <td>{pickLocale(locale, "5 días", "5 days")}</td>
              </tr>
              <tr>
                <td>explora_instructor_slug</td>
                <td>{pickLocale(locale, "Esencial (equipo)", "Essential (staff)")}</td>
                <td>
                  {pickLocale(
                    locale,
                    "Recuerda el instructor seleccionado en el panel.",
                    "Remembers the instructor selected in the staff panel.",
                  )}
                </td>
                <td>{pickLocale(locale, "Sesión / persistente corta", "Session / short-lived")}</td>
              </tr>
              <tr>
                <td>_ga, _ga_*</td>
                <td>Google Analytics 4</td>
                <td>
                  {pickLocale(
                    locale,
                    "Medir visitas y uso del sitio. Solo con tu consentimiento.",
                    "Measure visits and site use. Only with your consent.",
                  )}
                </td>
                <td>{pickLocale(locale, "Hasta 2 años (Google)", "Up to 2 years (Google)")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Google Analytics</h2>
        <p>
          {pickLocale(
            locale,
            "Si aceptas, cargamos Google Analytics 4 (gtag) para saber qué páginas se visitan. Google puede tratar estos datos según su propia política. Si eliges “Solo esenciales”, no cargamos el script.",
            "If you accept, we load Google Analytics 4 (gtag) to see which pages are visited. Google may process this data under its own policy. If you choose “Essential only”, we do not load the script.",
          )}
        </p>

        <h2>{pickLocale(locale, "Cómo cambiarlo", "How to change this")}</h2>
        <p>
          {pickLocale(
            locale,
            "Usa los botones de arriba o borra el almacenamiento del sitio en tu navegador. También puedes bloquear cookies de terceros en el navegador; si bloqueas las esenciales, pueden fallar el idioma, el carrito o el inicio de sesión.",
            "Use the buttons above or clear this site’s storage in your browser. You can also block third-party cookies in the browser; if you block essential ones, language, the cart or sign-in may break.",
          )}
        </p>
        <p>
          {pickLocale(locale, "Más detalle sobre datos personales en la ", "More detail on personal data in the ")}
          <Link href="/politica-de-privacidad">
            {pickLocale(locale, "política de privacidad", "privacy policy")}
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
