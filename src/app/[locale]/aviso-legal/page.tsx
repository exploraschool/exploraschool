import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/aviso-legal",
    title: pickLocale(locale, "Aviso legal", "Legal notice"),
    description: pickLocale(
      locale,
      `Aviso legal de ${site.name}. Titular del sitio, condiciones de uso y reservas.`,
      `Legal notice for ${site.name}. Website owner, terms of use and bookings.`,
    ),
  });
}

export default async function AvisoLegalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl prose-page">
        <h1>{pickLocale(locale, "Aviso legal", "Legal notice")}</h1>
        <p className="text-sm text-muted">
          {pickLocale(locale, "Última actualización: 4 de septiembre de 2026.", "Last updated: 4 September 2026.")}
        </p>

        <h2>{pickLocale(locale, "Titular", "Owner")}</h2>
        <p>
          {pickLocale(
            locale,
            "El titular de este sitio web es Explora School & Club, escuela de esquí, snowboard y telemark en Sierra Nevada (Granada, España).",
            "The owner of this website is Explora School & Club, a ski, snowboard and telemark school in Sierra Nevada (Granada, Spain).",
          )}
        </p>
        <ul>
          <li>
            {pickLocale(locale, "Nombre comercial: ", "Trading name: ")}
            {site.legalName}
          </li>
          <li>
            {pickLocale(locale, "Sitio web: ", "Website: ")}
            <a href={PRODUCTION_SITE_URL}>{PRODUCTION_SITE_URL.replace("https://", "")}</a>
          </li>
          <li>
            {pickLocale(locale, "Email: ", "Email: ")}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            {pickLocale(locale, "Teléfono / WhatsApp: ", "Phone / WhatsApp: ")}
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </li>
          <li>
            {pickLocale(
              locale,
              "Punto de encuentro: estación de esquí de Sierra Nevada, Borreguiles, Pradollano (18196).",
              "Meeting point: Sierra Nevada ski resort, Borreguiles, Pradollano (18196).",
            )}
          </li>
        </ul>
        <p>
          {pickLocale(
            locale,
            "Explora School & Club no publica NIF en este aviso. Para cualquier identificación o ejercicio de derechos, escríbenos a las vías de contacto anteriores.",
            "Explora School & Club does not publish a tax ID (NIF) in this notice. For identification or to exercise your rights, contact us using the details above.",
          )}
        </p>

        <h2>{pickLocale(locale, "Objeto", "Purpose")}</h2>
        <p>
          {pickLocale(
            locale,
            "Este sitio informa sobre clases y el club, permite solicitar reservas y gestionar el área de alumnos. Los precios incluyen IVA. El forfait, el seguro de la estación y el alquiler de material se contratan aparte.",
            "This site describes lessons and the club, lets you request bookings and use the student area. Prices include VAT. Lift passes, resort insurance and equipment rental are arranged separately.",
          )}
        </p>
        <p>
          {pickLocale(
            locale,
            "Explora School & Club no está afiliada a Cetursa Sierra Nevada, S.A.",
            "Explora School & Club is not affiliated with Cetursa Sierra Nevada, S.A.",
          )}
        </p>

        <h2>{pickLocale(locale, "Reservas y condiciones de uso", "Bookings and terms of use")}</h2>
        <p>
          {pickLocale(
            locale,
            "Enviar una solicitud en la web no cobra nada ni cierra un contrato de pago online. Te confirmamos por email la disponibilidad y el total estimado. El pago se acuerda con el instructor o el equipo. El precio definitivo se cierra al confirmar grupo, horario y extras.",
            "Submitting a request on the website does not charge you and is not an online payment contract. We confirm availability and an estimated total by email. Payment is arranged with the instructor or the team. The final price is settled when the group, schedule and extras are confirmed.",
          )}
        </p>
        <p>
          {pickLocale(
            locale,
            "Si Cetursa cierra la estación de forma obligatoria, la clase se cancela y se devuelve el importe. Otras incidencias (retrasos, meteo no de cierre, cambios de grupo) se gestionan como se explica en las ",
            "If Cetursa closes the resort mandatorily, the lesson is cancelled and you are refunded. Other issues (delays, weather that is not a closure, group changes) are handled as explained in the ",
          )}
          <Link href="/preguntas-frecuentes">
            {pickLocale(locale, "preguntas frecuentes", "FAQs")}
          </Link>
          .
        </p>

        <h2>{pickLocale(locale, "Propiedad intelectual", "Intellectual property")}</h2>
        <p>
          {pickLocale(
            locale,
            "Los contenidos, diseño, marca y código de este sitio son de Explora School & Club o de sus licenciantes. No está permitida su reproducción sin autorización, salvo el uso personal de la información publicada.",
            "The contents, design, brand and code of this site belong to Explora School & Club or its licensors. Reproduction without permission is not allowed, except for personal use of the published information.",
          )}
        </p>

        <h2>{pickLocale(locale, "Responsabilidad", "Liability")}</h2>
        <p>
          {pickLocale(
            locale,
            "Hacemos lo posible por mantener la información al día (horarios, precios, punto de encuentro). La montaña y la estación pueden cambiar las condiciones del día. Explora no responde del uso indebido del sitio ni de los contenidos de webs de terceros (Cetursa, Google Maps, Instagram, Facebook, TripAdvisor, WhatsApp).",
            "We try to keep information current (schedules, prices, meeting point). The mountain and the resort can change the day's conditions. Explora is not liable for misuse of the site or for third-party websites (Cetursa, Google Maps, Instagram, Facebook, TripAdvisor, WhatsApp).",
          )}
        </p>

        <h2>{isEn ? "Privacy and cookies" : "Privacidad y cookies"}</h2>
        <p>
          {pickLocale(locale, "El tratamiento de datos se describe en la ", "Personal data processing is described in the ")}
          <Link href="/politica-de-privacidad">
            {pickLocale(locale, "política de privacidad", "privacy policy")}
          </Link>
          {pickLocale(locale, " y el uso de cookies en la ", " and cookie use in the ")}
          <Link href="/politica-de-cookies">
            {pickLocale(locale, "política de cookies", "cookie policy")}
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
