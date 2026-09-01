import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CTASection } from "@/components/CTASection";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pickLocale(locale, "Club Explora", "Explora Club"),
    description: pickLocale(
      locale,
      "Únete al club Explora School & Club: comunidad, eventos y ventajas para esquiadores y snowboarders en Sierra Nevada.",
      "Join Explora School & Club: community, events and perks for skiers and snowboarders in Sierra Nevada.",
    ),
  };
}

export default async function ClubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Club</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            Explora School & Club
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            {pickLocale(
              locale,
              "Explora School & Club no es solo una escuela de esquí: somos una agrupación de instructores apasionados por la nieve y por Sierra Nevada. Cursos de 2 a 5 días para clubes deportivos, viajes de empresa y grupos que buscan una experiencia personalizada.",
              "Explora School & Club is not just a ski school: we are a group of instructors passionate about snow and Sierra Nevada. Two to five-day courses for sports clubs, corporate trips and groups seeking a personalised experience.",
            )}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {[
            {
              titleEs: "Grupos y empresas",
              titleEn: "Groups & corporate",
              descEs: "Cursos de 2 a 5 días. Grupo máximo 8 personas. Licenciados INEF, TECO, TAFAD.",
              descEn: "2 to 5-day courses. Maximum 8 people. Qualified INEF, TECO, TAFAD instructors.",
            },
            {
              titleEs: "Clubes deportivos",
              titleEn: "Sports clubs",
              descEs: "Programas a medida para federaciones y clubes que quieren progresar en la estación.",
              descEn: "Tailored programmes for federations and clubs who want to progress at the resort.",
            },
            {
              titleEs: "Comunidad",
              titleEn: "Community",
              descEs: "Síguenos en Instagram y Facebook para novedades, consejos y momentos en la nieve.",
              descEn: "Follow us on Instagram and Facebook for news, tips and moments on the snow.",
            },
          ].map((item) => (
            <article key={item.titleEs} className="card">
              <h2 className="font-display text-xl font-semibold text-hielo">
                {pickLocale(locale, item.titleEs, item.titleEn)}
              </h2>
              <p className="mt-3 text-sm text-muted">
                {pickLocale(locale, item.descEs, item.descEn)}
              </p>
            </article>
          ))}
        </div>

        <div className="container-page mt-12 text-center">
          <Link href="/clases" className="btn-secondary">
            {pickLocale(locale, "Ver cursos y tarifas", "View courses & prices")}
          </Link>
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
