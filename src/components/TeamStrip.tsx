import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getActiveInstructors } from "@/data/instructors";
import { pickLocale } from "@/lib/locale";

type TeamStripProps = {
  locale: string;
};

export function TeamStrip({ locale }: TeamStripProps) {
  const instructors = getActiveInstructors().slice(0, 6);

  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{pickLocale(locale, "Equipo Explora", "Explora Team")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {pickLocale(locale, "Instructores titulados", "Qualified instructors")}
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              {pickLocale(
                locale,
                "Nuestro equipo te guiará en todo lo que necesites. Licenciados INEF, TECO y TAFAD.",
                "Our team will guide you through everything you need. Qualified INEF, TECO and TAFAD professionals.",
              )}
            </p>
          </div>
          <Link href="/equipo" className="btn-secondary shrink-0">
            {pickLocale(locale, "Conocer al equipo", "Meet the team")}
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {instructors.map((instructor) => (
            <Link
              key={instructor.slug}
              href={`/equipo/${instructor.slug}`}
              className="group text-center"
            >
              <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-full border-2 border-transparent bg-hielo/5 transition group-hover:border-oro">
                <Image
                  src={instructor.photo}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <p className="mt-3 font-semibold text-hielo group-hover:text-accent">{instructor.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
