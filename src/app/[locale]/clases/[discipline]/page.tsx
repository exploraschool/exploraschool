import { getDisciplineBySlug, getMainDisciplines, type MainDisciplineId } from "@/data/disciplines";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CTASection } from "@/components/CTASection";
import { BackLink } from "@/components/BackLink";
import { DisciplineModalities } from "@/components/DisciplineModalities";
import { DisciplineProducts } from "@/components/cart/DisciplineProducts";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; discipline: string }> };

const disciplinesWithModalities: MainDisciplineId[] = ["esqui", "snowboard"];

export async function generateStaticParams() {
  return getMainDisciplines().map((d) => ({ discipline: d.slug }));
}

const SEO_TITLES: Record<string, { es: string; en: string }> = {
  esqui: {
    es: `Clases de esquí en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
    en: `Ski lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
  },
  snowboard: {
    es: `Clases de snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
    en: `Snowboard lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
  },
  telemark: {
    es: "Clases de telemark en Sierra Nevada",
    en: "Telemark lessons in Sierra Nevada",
  },
  "esqui-adaptado": {
    es: "Esquí adaptado en Sierra Nevada",
    en: "Adaptive skiing in Sierra Nevada",
  },
  ninos: {
    es: `Clases de esquí para niños en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h`,
    en: `Kids ski lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h`,
  },
};

const PAGE_TITLES: Record<string, { es: string; en: string }> = {
  esqui: { es: "Clases de esquí", en: "Ski lessons" },
  snowboard: { es: "Clases de snowboard", en: "Snowboard lessons" },
  telemark: { es: "Clases de telemark", en: "Telemark lessons" },
  "esqui-adaptado": { es: "Esquí adaptado", en: "Adaptive skiing" },
  ninos: { es: "Clases para niños", en: "Kids lessons" },
};

const PAGE_LEADS: Record<string, { es: string; en: string }> = {
  esqui: {
    es: "En pista, freeride y freestyle. Grupos de 1 a 8, todas las edades y niveles.",
    en: "On piste, freeride and freestyle. Groups of 1 to 8, all ages and levels.",
  },
  snowboard: {
    es: "De iniciación a snowpark y fuera de pista. También hay curso colectivo por las mañanas.",
    en: "From first turns to snowpark and off-piste. There is also a morning group course.",
  },
  telemark: {
    es: "Técnica nórdica en pista, con instructores especializados.",
    en: "Nordic-style technique on piste, with specialist instructors.",
  },
  "esqui-adaptado": {
    es: "Clases individualizadas e inclusivas, con seguridad y ritmo propio.",
    en: "Individualized, inclusive lessons at your own pace.",
  },
  ninos: {
    es: "Esquí y snowboard desde 3 años. Grupos de 1 a 8.",
    en: "Ski and snowboard from age 3. Groups of 1 to 8.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, discipline: slug } = await params;
  const d = getDisciplineBySlug(slug);
  if (!d) return {};
  const seo = SEO_TITLES[d.id];
  return buildPageMetadata({
    locale,
    path: `/clases/${slug}`,
    title: seo
      ? pickLocale(locale, seo.es, seo.en)
      : pickLocale(locale, d.nameEs, d.nameEn),
    description: pickLocale(locale, d.descriptionEs, d.descriptionEn),
  });
}

export default async function DisciplinePage({ params }: Props) {
  const { locale, discipline: slug } = await params;
  setRequestLocale(locale);
  const d = getDisciplineBySlug(slug);
  if (!d) notFound();

  const showModalities = disciplinesWithModalities.includes(d.id);
  const isEsquiPage = d.id === "esqui";

  const heading = pickLocale(
    locale,
    PAGE_TITLES[d.id]?.es ?? d.nameEs,
    PAGE_TITLES[d.id]?.en ?? d.nameEn,
  );

  const lead = pickLocale(
    locale,
    PAGE_LEADS[d.id]?.es ?? d.descriptionEs,
    PAGE_LEADS[d.id]?.en ?? d.descriptionEn,
  );

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: pickLocale(locale, "Clases", "Lessons"), path: "/clases" },
          { name: heading, path: `/clases/${slug}` },
        ]}
      />
      <section className="relative overflow-hidden border-b border-hielo/10 bg-white">
        <div className="container-page grid items-center gap-8 py-10 sm:py-12 md:grid-cols-2 md:gap-12 md:py-16">
          <div>
            <BackLink href="/clases">
              {pickLocale(locale, "Todas las clases", "All lessons")}
            </BackLink>
            <h1 className="page-title mt-4">{heading}</h1>
            <p className="page-lead">{lead}</p>
            <p className="mt-4 text-sm text-muted">
              <Link href="/como-llegar" className="font-semibold text-hielo underline decoration-hielo/25 underline-offset-2 hover:decoration-hielo">
                {pickLocale(locale, "Cómo llegar y punto de encuentro", "Getting here and meeting point")}
              </Link>
            </p>
            {isEsquiPage && (
              <p className="mt-3 text-sm">
                <Link href="/clases/snowboard" className="font-semibold text-accent hover:underline">
                  {pickLocale(locale, "Ver también clases de snowboard →", "See snowboard lessons too →")}
                </Link>
              </p>
            )}
            <a href="#clases-disponibles" className="btn-primary mt-8 inline-flex !w-auto">
              {pickLocale(locale, "Ver clases disponibles", "View available lessons")}
            </a>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={d.image}
              alt={pickLocale(locale, d.nameEs, d.nameEn)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {showModalities && <DisciplineModalities locale={locale} parentId={d.id} />}

      <section id="clases-disponibles" className="section-padding scroll-target bg-nieve">
        <div className="container-page">
          <Reveal>
            <h2 className="section-title">
              {pickLocale(locale, "Clases disponibles", "Available lessons")}
            </h2>
            <p className="section-intro mt-3">
              {pickLocale(locale, "Selecciona un formato y añádelo a tu reserva.", "Select a format and add it to your booking.")}
            </p>
          </Reveal>
          <div className="mt-8">
            <DisciplineProducts
              locale={locale}
              disciplineId={d.id}
              alsoIncludeDisciplineIds={d.id === "esqui" ? ["snowboard"] : undefined}
            />
          </div>
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
