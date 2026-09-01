import { getDisciplineBySlug, getMainDisciplines, type MainDisciplineId } from "@/data/disciplines";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CTASection } from "@/components/CTASection";
import { DisciplineModalities } from "@/components/DisciplineModalities";
import { DisciplineProducts } from "@/components/cart/DisciplineProducts";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; discipline: string }> };

const disciplinesWithModalities: MainDisciplineId[] = ["esqui", "snowboard"];

export async function generateStaticParams() {
  return getMainDisciplines().map((d) => ({ discipline: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, discipline: slug } = await params;
  const d = getDisciplineBySlug(slug);
  if (!d) return {};
  return buildPageMetadata({
    locale,
    path: `/clases/${slug}`,
    title: pickLocale(locale, d.nameEs, d.nameEn),
    description: pickLocale(locale, d.descriptionEs, d.descriptionEn),
  });
}

export default async function DisciplinePage({ params }: Props) {
  const { locale, discipline: slug } = await params;
  setRequestLocale(locale);
  const d = getDisciplineBySlug(slug);
  if (!d) notFound();

  const showModalities = disciplinesWithModalities.includes(d.id);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hielo/10 bg-white">
        <div className="container-page grid items-center gap-8 py-10 sm:py-12 md:grid-cols-2 md:gap-12 md:py-16">
          <div>
            <Link href="/clases" className="text-sm font-semibold text-accent hover:underline">
              ← {pickLocale(locale, "Todas las clases", "All lessons")}
            </Link>
            <h1 className="page-title mt-4">
              {pickLocale(locale, d.nameEs, d.nameEn)}
            </h1>
            <p className="page-lead">
              {pickLocale(locale, d.descriptionEs, d.descriptionEn)}
            </p>
            <p className="mt-4 text-sm text-muted">
              {showModalities
                ? pickLocale(
                    locale,
                    "Clases en pista, freeride y freestyle con instructores titulados. Punto de encuentro en Borreguiles, salida Al-Andalus.",
                    "Piste, freeride and freestyle lessons with qualified instructors. Meeting point at Borreguiles, Al-Andalus gondola exit.",
                  )
                : pickLocale(
                    locale,
                    "Clases particulares y grupales con instructores con nombre y cara. Punto de encuentro en Borreguiles.",
                    "Private and group lessons with named instructors. Meeting point at Borreguiles.",
                  )}
            </p>
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

      <section id="clases-disponibles" className="section-padding bg-nieve scroll-mt-24">
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
            <DisciplineProducts locale={locale} disciplineId={d.id} />
          </div>
        </div>
      </section>

      <CTASection locale={locale} onClassesPage />
    </>
  );
}
