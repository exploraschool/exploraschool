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
    path: "/politica-de-privacidad",
    title: pickLocale(locale, "Política de privacidad", "Privacy policy"),
    description: pickLocale(
      locale,
      `Política de privacidad de ${site.name}: cómo tratamos reservas, cuenta de alumno, fotos y comunicaciones en Sierra Nevada.`,
      `Privacy policy for ${site.name}: how we handle bookings, student accounts, photos and emails in Sierra Nevada.`,
    ),
  });
}

export default async function PrivacidadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl prose-page">
        <h1>{pickLocale(locale, "Política de privacidad", "Privacy policy")}</h1>
        <p className="text-sm text-muted">
          {pickLocale(locale, "Última actualización: 15 de octubre de 2026.", "Last updated: 15 October 2026.")}
        </p>

        <h2>{pickLocale(locale, "Responsable", "Controller")}</h2>
        <p>
          {pickLocale(
            locale,
            `El responsable del tratamiento es ${site.legalOwner.name}, quien ejerce la actividad bajo el nombre comercial ${site.legalName}.`,
            `The data controller is ${site.legalOwner.name}, trading as ${site.legalName}.`,
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
            {pickLocale(locale, "Reservas y ejercicio de derechos: ", "Bookings and data rights: ")}
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {" · "}
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </li>
          <li>
            {pickLocale(locale, "Web: ", "Website: ")}
            <a href={PRODUCTION_SITE_URL}>{PRODUCTION_SITE_URL.replace("https://", "")}</a>
          </li>
        </ul>

        <h2>{pickLocale(locale, "Qué datos tratamos y para qué", "What data we process and why")}</h2>
        <ul>
          <li>
            {pickLocale(
              locale,
              "Consultas (formulario de contacto): nombre, email, teléfono y mensaje. Base: consentimiento y, si deriva en reserva, ejecución de medidas precontractuales.",
              "Enquiries (contact form): name, email, phone and message. Basis: consent and, if it leads to a booking, pre-contractual steps.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Reservas: datos de contacto, fechas, disciplina, número de personas, instructor preferido y notas. Base: ejecución del servicio de clases. No hay pago online en la web. Con esos mismos datos guardamos un registro interno para gestionar la solicitud. No se usa para publicidad ni boletines.",
              "Bookings: contact details, dates, discipline, group size, preferred instructor and notes. Basis: performing the lesson service. There is no online payment on the website. We keep an internal record of the same details to manage the request. It is not used for advertising or newsletters.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Área de alumnos: inicio de sesión con Google (nombre, email y foto de perfil que Google nos envía), reservas asociadas y ficha de alumno. Base: ejecución del servicio.",
              "Student area: Google sign-in (name, email and profile photo Google sends us), linked bookings and student profile. Basis: performing the service.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Fotos y vídeos: al subir cada archivo queda registrada la autorización para usarlo en la corrección de la clase y, si se publica, en la galería. Base: consentimiento. Si sale un menor, la autorización la da el padre, la madre o el tutor.",
              "Photos and videos: each upload records permission to use the file for lesson feedback and, if it is published, in the gallery. Basis: consent. If a child appears, a parent or guardian gives that permission.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Emails de confirmación, cancelación y guía de llegada: los enviamos para gestionar la reserva.",
              "Confirmation, cancellation and arrival-guide emails: we send them to manage the booking.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Analítica web (Google Analytics 4): solo si aceptas cookies analíticas. Ver la ",
              "Web analytics (Google Analytics 4): only if you accept analytics cookies. See the ",
            )}
            <Link href="/politica-de-cookies">
              {pickLocale(locale, "política de cookies", "cookie policy")}
            </Link>
            .
          </li>
        </ul>

        <h2>{pickLocale(locale, "Menores", "Children")}</h2>
        <p>
          {pickLocale(
            locale,
            "Damos clases desde los 3 años. La reserva la hace un adulto responsable. La autorización de cada foto o vídeo se registra al subir el archivo.",
            "We teach from age 3. An adult is responsible for the booking. Permission for each photo or video is recorded when the file is uploaded.",
          )}
        </p>

        <h2>{pickLocale(locale, "Destinatarios", "Recipients")}</h2>
        <p>
          {pickLocale(
            locale,
            "No vendemos tus datos. Los usamos para dar el servicio y, cuando hace falta, estos proveedores:",
            "We do not sell your data. We use it to deliver the service and, where needed, these providers:",
          )}
        </p>
        <ul>
          <li>
            {pickLocale(
              locale,
              "Google (Firebase Authentication, Firestore, Storage y, si consientes, Google Analytics) para cuenta, reservas, archivos y medición de visitas.",
              "Google (Firebase Authentication, Firestore, Storage and, if you consent, Google Analytics) for accounts, bookings, files and visit measurement.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Vercel, para alojar esta web. Puede ver datos técnicos de la visita, como la dirección IP, en los registros del servidor.",
              "Vercel, to host this website. It may see technical visit data, such as the IP address, in server logs.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Resend, para enviar emails de gestión de la reserva (confirmación, cancelación, guía de llegada). No enviamos publicidad.",
              "Resend, to send booking emails (confirmation, cancellation, arrival guide). We do not send advertising.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "WhatsApp / Meta, solo si tú nos escribes o eliges contactar por WhatsApp.",
              "WhatsApp / Meta, only if you write to us or choose to contact us on WhatsApp.",
            )}
          </li>
        </ul>
        <p>
          {pickLocale(
            locale,
            "Google, Vercel y Resend pueden tratar datos fuera del Espacio Económico Europeo. Usan cláusulas contractuales tipo u otras garantías previstas en el RGPD.",
            "Google, Vercel and Resend may process data outside the European Economic Area. They use standard contractual clauses or other GDPR safeguards.",
          )}
        </p>

        <h2>{pickLocale(locale, "Conservación", "Retention")}</h2>
        <p>
          {pickLocale(
            locale,
            "Consultas y reservas se conservan 5 años desde la última gestión de esa solicitud. La cuenta, la ficha y las fotos o vídeos se conservan mientras la cuenta siga en uso y, como máximo, 5 años desde la última clase, o antes si pides que se borren. Si una norma obliga a guardar algo más tiempo, se respeta ese plazo.",
            "Enquiries and bookings are kept for 5 years from the last action on that request. The account, profile and photos or videos stay while the account is in use and for at most 5 years after the last lesson, or sooner if you ask us to erase them. If a law requires a longer period, that period applies.",
          )}
        </p>

        <h2>{pickLocale(locale, "Tus derechos", "Your rights")}</h2>
        <p>
          {pickLocale(
            locale,
            "Puedes pedir acceso, rectificación, supresión, limitación, oposición y portabilidad escribiendo a ",
            "You can request access, rectification, erasure, restriction, objection and portability by writing to ",
          )}
          <a href={`mailto:${site.email}`}>{site.email}</a>
          {pickLocale(
            locale,
            ". También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
            ". You may also lodge a complaint with the Spanish Data Protection Agency (aepd.es).",
          )}
        </p>
        <p>
          {pickLocale(
            locale,
            "No tomamos decisiones automatizadas que te produzcan efectos jurídicos.",
            "We do not take automated decisions that produce legal effects for you.",
          )}
        </p>
      </div>
    </article>
  );
}
