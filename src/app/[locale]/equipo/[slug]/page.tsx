import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  getInstructorBySlug,
  getActiveInstructors,
  type InstructorSlug,
} from "@/data/instructors";
import { getReviewsByInstructor } from "@/data/reviews";
import { disciplines } from "@/data/disciplines";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getActiveInstructors().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const instructor = getInstructorBySlug(slug as InstructorSlug);
  if (!instructor) return { title: "Instructor" };
  return { title: `${instructor.name} — Explora School & Club` };
}

export default async function InstructorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const instructor = getInstructorBySlug(slug as InstructorSlug);
  if (!instructor) notFound();

  const reviews = getReviewsByInstructor(instructor.name);

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page">
          <Link href="/equipo" className="text-sm font-medium text-hielo hover:text-accent">
            ← {pickLocale(locale, "Volver al equipo", "Back to team")}
          </Link>
          <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
            <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-hielo/5">
              <Image
                src={instructor.photo}
                alt={instructor.name}
                fill
                className="object-cover"
                sizes="280px"
                priority
              />
            </div>
            <div>
              <h1 className="font-display text-4xl font-semibold">{instructor.name}</h1>
              <p className="mt-4 text-lg text-muted leading-relaxed">
                {pickLocale(locale, instructor.bioEs, instructor.bioEn)}
              </p>
              <p className="mt-4 text-sm font-medium text-oro">
                {instructor.disciplines
                  .map((d) => {
                    const disc = disciplines.find((x) => x.id === d);
                    return disc ? pickLocale(locale, disc.nameEs, disc.nameEn) : d;
                  })
                  .join(" · ")}
              </p>
              <p className="mt-2 text-sm text-muted">
                {pickLocale(locale, "Idiomas:", "Languages:")}{" "}
                {instructor.languages.map((l) => l.toUpperCase()).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section-padding bg-nieve">
          <div className="container-page">
            <h2 className="font-display text-2xl font-semibold">
              {pickLocale(locale, "Opiniones", "Reviews")}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <blockquote key={review.id} className="card">
                  <p className="text-sm text-muted">
                    &ldquo;{pickLocale(locale, review.textEs, review.textEn)}&rdquo;
                  </p>
                  <footer className="mt-3 text-xs font-semibold text-oro">{review.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
