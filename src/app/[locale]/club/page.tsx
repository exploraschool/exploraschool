import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CTASection } from "@/components/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/club",
    title: pickLocale(locale, "Club Explora", "Explora Club"),
    description: pickLocale(
      locale,
      "Únete al club Explora School & Club: comunidad, eventos y ventajas para esquiadores y snowboarders en Sierra Nevada.",
      "Join Explora School & Club: community, events and perks for skiers and snowboarders in Sierra Nevada.",
    ),
  });
}

export default async function ClubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const perks = [
    {
      titleEs: "Grupos y empresas",
      titleEn: "Groups & corporate",
      descEs: "Cursos de 2 a 5 días. Grupo máximo 8 personas. Licenciados INEF, TECO, TAFAD.",
      descEn: "2 to 5-day courses. Maximum 8 people. Qualified INEF, TECO, TAFAD instructors.",
      icon: "🏢",
    },
    {
      titleEs: "Clubes deportivos",
      titleEn: "Sports clubs",
      descEs: "Programas a medida para federaciones y clubes que quieren progresar en la estación.",
      descEn: "Tailored programmes for federations and clubs who want to progress at the resort.",
      icon: "⛷",
    },
    {
      titleEs: "Comunidad",
      titleEn: "Community",
      descEs: "Síguenos en Instagram y Facebook para novedades, consejos y momentos en la nieve.",
      descEn: "Follow us on Instagram and Facebook for news, tips and moments on the snow.",
      icon: "❄",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Club"
        title="Explora School & Club"
        description={pickLocale(
          locale,
          "No somos solo una escuela de esquí: somos una agrupación de instructores apasionados por la nieve y por Sierra Nevada. Cursos de 2 a 5 días para clubes deportivos, viajes de empresa y grupos que buscan una experiencia personalizada.",
          "We are not just a ski school: we are a group of instructors passionate about snow and Sierra Nevada. Two to five-day courses for sports clubs, corporate trips and groups seeking a personalised experience.",
        )}
      />

      <section className="section-padding bg-nieve">
        <div className="container-page grid gap-6 md:grid-cols-3 md:gap-8">
          {perks.map((item, i) => (
            <Reveal key={item.titleEs} delay={i * 80}>
              <article className="card-interactive h-full">
                <span className="text-3xl" aria-hidden>{item.icon}</span>
                <h2 className="mt-4 font-display text-xl font-semibold text-hielo">
                  {pickLocale(locale, item.titleEs, item.titleEn)}
                </h2>
                <p className="mt-3 text-sm text-muted">
                  {pickLocale(locale, item.descEs, item.descEn)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="container-page mt-12 rounded-2xl border border-hielo/10 bg-white p-8 text-center shadow-sm md:p-10">
            <h2 className="font-display text-2xl font-semibold text-hielo">
              {pickLocale(locale, "¿Organizas un viaje de empresa o club?", "Planning a corporate or club trip?")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              {pickLocale(
                locale,
                "Añade el curso para empresas a tu reserva o escríbenos con las fechas, número de participantes y nivel del grupo. Te preparamos una propuesta personalizada.",
                "Add the corporate course to your booking or email us with dates, group size and level. We will prepare a tailored proposal.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <AddToCartButton
                productId="curso-empresa"
                label={pickLocale(locale, "Añadir curso de empresa", "Add corporate course")}
              />
              <Link href="/contacto" className="btn-secondary !w-auto">
                {pickLocale(locale, "Solicitar propuesta", "Request a quote")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
