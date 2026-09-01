import Image from "next/image";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getActiveInstructors } from "@/data/instructors";
import { pickLocale } from "@/lib/locale";

type TeamStripProps = {
  locale: string;
};

export function TeamStrip({ locale }: TeamStripProps) {
  const instructors = getActiveInstructors().slice(0, 6);

  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <SectionHeader
              eyebrow={pickLocale(locale, "Equipo Explora", "Explora Team")}
              title={pickLocale(locale, "Instructores titulados", "Qualified instructors")}
              description={pickLocale(
                locale,
                `Nuestro equipo te guiará en todo lo que necesites. ${site.instructorQualificationsEs}.`,
                `Our team will guide you through everything you need. ${site.instructorQualificationsEn}.`,
              )}
            />
            <Link href="/equipo" className="btn-secondary shrink-0 md:!w-auto">
              {pickLocale(locale, "Conocer al equipo", "Meet the team")}
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5 md:mt-12 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
          {instructors.map((instructor, i) => (
            <Reveal key={instructor.slug} delay={i * 60}>
              <Link href={`/equipo/${instructor.slug}`} className="group text-center">
                <div className="relative mx-auto aspect-square w-full max-w-[96px] overflow-hidden rounded-full bg-gradient-to-br from-hielo/10 to-oro/10 p-0.5 shadow-md transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(201,168,108,0.3)] sm:max-w-[112px] md:max-w-[128px] lg:max-w-[140px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image
                      src={instructor.photo}
                      alt={instructor.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 96px, 140px"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold text-hielo transition-colors group-hover:text-accent sm:mt-3">
                  {instructor.name}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
