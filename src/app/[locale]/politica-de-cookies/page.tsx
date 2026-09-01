import { setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: pickLocale(locale, "Política de cookies", "Cookie policy") };
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl prose-page">
        <h1>{pickLocale(locale, "Política de cookies", "Cookie policy")}</h1>
        <p>
          {pickLocale(
            locale,
            "Explora School & Club utiliza cookies esenciales para el funcionamiento del sitio y, opcionalmente, cookies analíticas para mejorar la experiencia.",
            "Explora School & Club uses essential cookies for site functionality and, optionally, analytics cookies to improve the experience.",
          )}
        </p>
        <h2>{pickLocale(locale, "Cookies esenciales", "Essential cookies")}</h2>
        <p>
          {pickLocale(
            locale,
            "Permiten recordar preferencias básicas como el idioma y la aceptación del aviso de cookies.",
            "They remember basic preferences such as language and cookie banner acceptance.",
          )}
        </p>
        <h2>{pickLocale(locale, "Gestión", "Management")}</h2>
        <p>
          {pickLocale(
            locale,
            "Puedes configurar tu navegador para bloquear cookies. Algunas funciones del sitio podrían dejar de estar disponibles.",
            "You can configure your browser to block cookies. Some site features may become unavailable.",
          )}
        </p>
      </div>
    </article>
  );
}
