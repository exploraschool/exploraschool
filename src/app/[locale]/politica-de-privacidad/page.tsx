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
      `Política de privacidad de ${site.name}. Cómo tratamos reservas, cuenta de alumno, fotos y comunicaciones.`,
      `Privacy policy for ${site.name}. How we handle bookings, student accounts, photos and emails.`,
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
          {pickLocale(locale, "Última actualización: 4 de septiembre de 2026.", "Last updated: 4 September 2026.")}
        </p>

        <h2>{pickLocale(locale, "Responsable", "Controller")}</h2>
        <p>
          {pickLocale(
            locale,
            "El responsable del tratamiento es Explora School & Club.",
            "The data controller is Explora School & Club.",
          )}
        </p>
        <ul>
          <li>
            {pickLocale(locale, "Email: ", "Email: ")}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            {pickLocale(locale, "Teléfono / WhatsApp: ", "Phone / WhatsApp: ")}
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </li>
          <li>
            {pickLocale(locale, "Web: ", "Website: ")}
            <a href={PRODUCTION_SITE_URL}>{PRODUCTION_SITE_URL.replace("https://", "")}</a>
          </li>
        </ul>
        <p>
          {pickLocale(
            locale,
            "No publicamos NIF en esta política. Para ejercer derechos o identificarnos, usa el email o el teléfono anteriores.",
            "We do not publish a tax ID (NIF) in this policy. To exercise your rights or identify us, use the email or phone above.",
          )}
        </p>

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
              "Reservas: datos de contacto, fechas, disciplina, número de personas, instructor preferido y notas. Base: ejecución del servicio de clases. No hay pago online en la web.",
              "Bookings: contact details, dates, discipline, group size, preferred instructor and notes. Basis: performing the lesson service. There is no online payment on the website.",
            )}
          </li>
          <li>
            {pickLocale(
              locale,
              "Área de alumnos: inicio de sesión con Google (nombre, email y foto de perfil que Google nos envía), reservas asociadas, fichas de progreso y fotos o vídeos que subas o que el equipo suba para corrección. Base: ejecución del servicio y, para imágenes, tu consentimiento o el del padre/madre/tutor.",
              "Student area: Google sign-in (name, email and profile photo Google sends us), linked bookings, progress notes, and photos or videos you upload or the team uploads for technique feedback. Basis: performing the service and, for images, your consent or that of a parent/guardian.",
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
            "Damos clases desde los 3 años. La reserva y el consentimiento de imagen los hace un adulto responsable. No está pensada un área de alumnos para un menor sin ese adulto.",
            "We teach from age 3. An adult is responsible for the booking and for image consent. The student area is not meant for a child to use without that adult.",
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
              "Resend, para enviar emails transaccionales (confirmación, cancelación, guía de llegada).",
              "Resend, to send transactional emails (confirmation, cancellation, arrival guide).",
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
            "Algunos de estos servicios pueden tratar datos fuera del Espacio Económico Europeo. Google aplica cláusulas contractuales tipo y otras garantías previstas en el RGPD.",
            "Some of these services may process data outside the European Economic Area. Google uses standard contractual clauses and other GDPR safeguards.",
          )}
        </p>

        <h2>{pickLocale(locale, "Conservación", "Retention")}</h2>
        <p>
          {pickLocale(
            locale,
            "Guardamos consultas y reservas mientras sirvan para el servicio y las obligaciones legales (por ejemplo, facturación si la hay). La cuenta de alumno y los archivos se mantienen mientras la cuenta esté activa o hasta que pidas su supresión, salvo que debamos conservarlos por un plazo legal.",
            "We keep enquiries and bookings for as long as needed for the service and legal duties (for example invoicing, if any). The student account and files stay while the account is active or until you ask us to erase them, unless we must keep them for a legal period.",
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
