import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getActiveInstructors } from "@/data/instructors";
import { disciplines } from "@/data/disciplines";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pickLocale(locale, "Equipo", "Team"),
    description: pickLocale(
      locale,
      "Conoce a los instructores de Explora School & Club en Sierra Nevada.",
      "Meet the instructors at Explora School & Club in Sierra Nevada.",
    ),
  };
}

export default async function EquipoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const instructors = getActiveInstructors();

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page">
          <p className="eyebrow">{pickLocale(locale, "Equipo Explora", "Explora Team")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {pickLocale(locale, "Instructores/as", "Instructors")}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            {pickLocale(
              locale,
              "Nuestro equipo te guiará en todo lo que necesites. Estamos a tu disposición.",
              "Our team will guide you through everything you need. We are here for you.",
            )}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <Link
              key={instructor.slug}
              href={`/equipo/${instructor.slug}`}
              className="group overflow-hidden rounded-xl border border-hielo/10 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/5] bg-hielo/5">
                <Image
                  src={instructor.photo}
                  alt={instructor.name}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-hielo group-hover:text-accent">
                  {instructor.name}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted">
                  {pickLocale(locale, instructor.bioEs, instructor.bioEn)}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-oro">
                  {instructor.disciplines
                    .map((d) => {
                      const disc = disciplines.find((x) => x.id === d);
                      return disc ? pickLocale(locale, disc.nameEs, disc.nameEn) : d;
                    })
                    .join(" · ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
