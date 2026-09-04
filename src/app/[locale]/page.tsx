import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { StickyBookBar } from "@/components/StickyBookBar";
import { AboutVisual } from "@/components/AboutVisual";
import { DisciplinesGrid } from "@/components/DisciplinesGrid";
import { ProductsSection } from "@/components/ProductsSection";
import { HomeSocialProof } from "@/components/HomeSocialProof";
import { Testimonials } from "@/components/Testimonials";
import { HomeClosing } from "@/components/HomeClosing";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { site } from "@/data/site";
import { buildPageMetadata } from "@/lib/metadata";
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
      `Clases de esquí y snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
      `Ski and snowboard lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
    ),
    description: pickLocale(locale, site.homeMetaDescriptionEs, site.homeMetaDescriptionEn),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Hero locale={locale} />
      <TrustBar locale={locale} />
      <AboutVisual locale={locale} compact />
      <DisciplinesGrid locale={locale} compact />
      <ProductsSection locale={locale} limit={3} compact />
      <HomeSocialProof locale={locale} />
      <Testimonials locale={locale} limit={3} />
      <HomeClosing locale={locale} />
      <StickyBookBar locale={locale} />
    </div>
  );
}
