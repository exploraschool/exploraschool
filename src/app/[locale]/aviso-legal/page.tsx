import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
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
      `Aviso legal de ${site.name}: titular del sitio, condiciones de uso y de las reservas de clases en Sierra Nevada.`,
      `Legal notice for ${site.name}: website owner, terms of use and ski lesson bookings in Sierra Nevada.`,
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
          {pickLocale(locale, "Última actualización: 15 de octubre de 2026.", "Last updated: 15 October 2026.")}
        </p>

        <h2>{pickLocale(locale, "Titular", "Owner")}</h2>
        <p>
          {pickLocale(
            locale,
            `${site.legalOwner.name} es el titular de este sitio y ejerce la actividad bajo el nombre comercial ${site.legalName}, escuela de esquí, snowboard y telemark en Sierra Nevada (Granada, España).`,
            `${site.legalOwner.name} owns this website and trades as ${site.legalName}, a ski, snowboard and telemark school in Sierra Nevada (Granada, Spain).`,
          )}
        </p>
        <ul>
          <li>
            {pickLocale(locale, "NIF: ", "Tax ID (NIF): ")}
            {site.legalOwner.nif}
          </li>
          <li>
            {pickLocale(locale, "Domicilio: ", "Address: ")}
            {`${site.legalOwner.streetAddress}, ${site.legalOwner.postalCode} ${site.legalOwner.locality} (${site.legalOwner.region})`}
          </li>
          <li>
            {pickLocale(locale, "Email: ", "Email: ")}
            <a href={`mailto:${site.legalOwner.email}`}>{site.legalOwner.email}</a>
          </li>
          <li>
            {pickLocale(locale, "Teléfono: ", "Phone: ")}
            <a href={`tel:${site.legalOwner.phone}`}>{site.legalOwner.phoneDisplay}</a>
          </li>
          <li>
            {pickLocale(locale, "Reservas: ", "Bookings: ")}
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {" · "}
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </li>
          <li>
            {pickLocale(
              locale,
              "Punto de encuentro de las clases: estación de esquí de Sierra Nevada, Borreguiles, Pradollano (18196).",
              "Lesson meeting point: Sierra Nevada ski resort, Borreguiles, Pradollano (18196).",
            )}
          </li>
        </ul>

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
            "Enviar una solicitud en la web no cobra nada ni cierra un contrato de pago online. Te confirmamos por email la disponibilidad y el precio de la reserva. El pago se acuerda con el instructor o el equipo.",
            "Submitting a request on the website does not charge you and is not an online payment contract. We confirm availability and the booking price by email. Payment is arranged with the instructor or the team.",
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
