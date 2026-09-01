import { setRequestLocale } from "next-intl/server";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
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
      `Política de privacidad de ${site.name}. Cómo tratamos tus datos personales y reservas.`,
      `Privacy policy for ${site.name}. How we handle your personal data and bookings.`,
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
        <p>
          {pickLocale(
            locale,
            `${site.legalName} es responsable del tratamiento de los datos personales que nos facilites a través de este sitio web o por email.`,
            `${site.legalName} is responsible for processing personal data you provide through this website or by email.`,
          )}
        </p>
        <h2>{pickLocale(locale, "Finalidad", "Purpose")}</h2>
        <p>
          {pickLocale(
            locale,
            "Tratamos tus datos para gestionar consultas, reservas de clases y comunicaciones comerciales relacionadas con nuestros servicios.",
            "We process your data to manage enquiries, lesson bookings and commercial communications related to our services.",
          )}
        </p>
        <h2>{pickLocale(locale, "Legitimación", "Legal basis")}</h2>
        <p>
          {pickLocale(
            locale,
            "La base legal es tu consentimiento al enviar el formulario de contacto y, en su caso, la ejecución de un contrato de prestación de servicios.",
            "The legal basis is your consent when submitting the contact form and, where applicable, the performance of a service contract.",
          )}
        </p>
        <h2>{pickLocale(locale, "Conservación y derechos", "Retention and rights")}</h2>
        <p>
          {pickLocale(
            locale,
            "Conservaremos tus datos mientras sea necesario para la finalidad indicada. Puedes ejercer tus derechos de acceso, rectificación, supresión y otros contactando en ",
            "We will retain your data as long as necessary for the stated purpose. You may exercise your rights of access, rectification, erasure and others by contacting ",
          )}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </article>
  );
}
