import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { AboutVisual } from "@/components/AboutVisual";
import { HowItWorks } from "@/components/HowItWorks";
import { DisciplinesGrid } from "@/components/DisciplinesGrid";
import { ProductsSection } from "@/components/ProductsSection";
import { VideoShowcase } from "@/components/VideoShowcase";
import { PhotoGallery } from "@/components/PhotoGallery";
import { TeamStrip } from "@/components/TeamStrip";
import { Testimonials } from "@/components/Testimonials";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { pickLocale } from "@/lib/locale";
import { site } from "@/data/site";
import { buildPageMetadata } from "@/lib/metadata";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/",
    title: pickLocale(
      locale,
      "Clases de esquí y snowboard en Sierra Nevada",
      "Ski and snowboard lessons in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Clases de esquí, snowboard y telemark en Sierra Nevada. Instructores con nombre y cara desde 2010. Reserva por WhatsApp.",
      "Ski, snowboard and telemark lessons in Sierra Nevada. Named instructors since 2010. Book via WhatsApp.",
    ),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <TrustBar locale={locale} />
      <AboutVisual locale={locale} />
      <HowItWorks locale={locale} />
      <DisciplinesGrid locale={locale} />
      <ProductsSection locale={locale} />
      <VideoShowcase locale={locale} />
      <PhotoGallery locale={locale} />
      <TeamStrip locale={locale} />
      <Testimonials locale={locale} />

      <section className="section-padding bg-nieve">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{pickLocale(locale, "Antes de atarte las botas", "Before you buckle up")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
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
