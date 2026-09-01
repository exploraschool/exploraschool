import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { DisciplinesGrid } from "@/components/DisciplinesGrid";
import { ProductsSection } from "@/components/ProductsSection";
import { TeamStrip } from "@/components/TeamStrip";
import { Testimonials } from "@/components/Testimonials";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Explora School & Club — Clases de esquí y snowboard en Sierra Nevada",
    description: pickLocale(locale, site.taglineEs, site.taglineEn),
    alternates: {
      canonical: `${site.domain}/${locale}`,
      languages: { es: `${site.domain}/es`, en: `${site.domain}/en` },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <TrustBar locale={locale} />

      <section className="section-padding bg-white">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">{pickLocale(locale, "¿Quiénes somos?", "Who we are")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(locale, "Experiencia única en la nieve", "A unique experience on the snow")}
            </h2>
          </div>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              {pickLocale(
                locale,
                "Explora School & Club es una agrupación de instructores/as, fundada en 2010 para ofrecerte una experiencia única en la enseñanza de los deportes de invierno en Sierra Nevada.",
                "Explora School & Club is a group of instructors founded in 2010 to offer you a unique experience teaching winter sports in Sierra Nevada.",
              )}
            </p>
            <p>
              {pickLocale(
                locale,
                "Desde Explora School & Club queremos dar accesibilidad a la contratación de clases y garantizar un entorno seguro. La diversión y el aprendizaje están garantizados.",
                "At Explora School & Club we want to make booking lessons accessible and guarantee a safe environment. Fun and learning are assured.",
              )}
            </p>
            <p>
              {pickLocale(
                locale,
                "Te ofrecemos clases dinámicas y divertidas para que disfrutes del esquí, esquí adaptado, snowboard y telemark. Pregúntanos y te asesoraremos en todo lo relativo a tus vacaciones en Sierra Nevada.",
                "We offer dynamic, fun lessons so you can enjoy ski, adaptive skiing, snowboard and telemark. Ask us anything about your Sierra Nevada holiday.",
              )}
            </p>
          </div>
        </div>
      </section>

      <DisciplinesGrid locale={locale} />
      <ProductsSection locale={locale} />
      <TeamStrip locale={locale} />
      <Testimonials locale={locale} />

      <section className="section-padding bg-nieve">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{pickLocale(locale, "Preguntas frecuentes", "FAQs")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(locale, "Resolvemos tus dudas", "We answer your questions")}
            </h2>
          </div>
          <div className="mt-10">
            <FAQAccordion locale={locale} limit={5} />
          </div>
          <div className="mt-6">
            <Link href="/preguntas-frecuentes" className="text-sm font-semibold text-hielo hover:text-accent">
              {pickLocale(locale, "Ver todas las FAQs →", "View all FAQs →")}
            </Link>
          </div>
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
