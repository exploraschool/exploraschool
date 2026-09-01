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
    path: "/aviso-legal",
    title: pickLocale(locale, "Aviso legal", "Legal notice"),
    description: pickLocale(
      locale,
      `Aviso legal de ${site.name}. Información del titular del sitio web y condiciones de uso.`,
      `Legal notice for ${site.name}. Website owner information and terms of use.`,
    ),
  });
}

export default async function AvisoLegalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl prose-page">
        <h1>{pickLocale(locale, "Aviso legal", "Legal notice")}</h1>
        <p>
          {pickLocale(
            locale,
            `Titular del sitio web: ${site.legalName}. Dominio: ${site.domain}. Email de contacto: ${site.email}. Teléfono: ${site.phoneDisplay}.`,
            `Website owner: ${site.legalName}. Domain: ${site.domain}. Contact email: ${site.email}. Phone: ${site.phoneDisplay}.`,
          )}
        </p>
        <h2>{pickLocale(locale, "Objeto", "Purpose")}</h2>
        <p>
          {pickLocale(
            locale,
            "Este sitio web tiene carácter informativo y comercial sobre los servicios de enseñanza de deportes de invierno ofrecidos por Explora School & Club en Sierra Nevada.",
            "This website provides information and commercial details about winter sports instruction services offered by Explora School & Club in Sierra Nevada.",
          )}
        </p>
        <h2>{pickLocale(locale, "Propiedad intelectual", "Intellectual property")}</h2>
        <p>
          {pickLocale(
            locale,
            "Los contenidos, diseño y código de este sitio son propiedad de Explora School & Club o de sus licenciantes. Queda prohibida su reproducción sin autorización.",
            "The contents, design and code of this site belong to Explora School & Club or its licensors. Reproduction without permission is prohibited.",
          )}
        </p>
        <h2>{pickLocale(locale, "Responsabilidad", "Liability")}</h2>
        <p>
          {pickLocale(
            locale,
            "Explora School & Club no se hace responsable del uso indebido de la información publicada ni de enlaces a sitios de terceros.",
            "Explora School & Club is not liable for misuse of published information or links to third-party sites.",
          )}
        </p>
      </div>
    </article>
  );
}
