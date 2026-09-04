import { getMainDisciplines } from "@/data/disciplines";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { pickLocale } from "@/lib/locale";

type DisciplinesGridProps = {
  locale: string;
  compact?: boolean;
};

export function DisciplinesGrid({ locale, compact = false }: DisciplinesGridProps) {
  const disciplines = getMainDisciplines();

  if (compact) {
    return (
      <section className="section-padding-sm bg-nieve">
        <div className="container-page">
          <Reveal>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
              <SectionHeader
                eyebrow={pickLocale(locale, "Disciplinas", "Disciplines")}
                title={pickLocale(locale, "¿Qué quieres practicar?", "What do you want to ride?")}
              />
              </div>
              <Link href="/clases" className="btn-secondary shrink-0 !w-auto">
                {pickLocale(locale, "Ver todas", "View all")}
              </Link>
            </div>
          </Reveal>

          <div className="x-scroller x-scroller--bleed section-body-sm flex gap-3 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
            {disciplines.map((d, i) => (
              <Reveal key={d.id} delay={i * 50} className="w-[140px] shrink-0 sm:w-auto">
                <Link
                  href={`/clases/${d.slug}`}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-hielo/8 bg-white shadow-sm transition hover:border-accent/25 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-hielo/5">
                    <Image
                      src={d.image}
                      alt={pickLocale(
                        locale,
                        `${d.nameEs} en Sierra Nevada`,
                        `${d.nameEn} in Sierra Nevada`,
                      )}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="160px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pizarra/50 to-transparent" />
                  </div>
                  <p className="px-3 py-2.5 text-center text-xs font-semibold text-hielo group-hover:text-accent sm:text-sm">
                    {pickLocale(locale, d.nameEs, d.nameEn)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding ski-pattern mesh-light">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            eyebrow={pickLocale(locale, "Modalidades", "Disciplines")}
            title={pickLocale(locale, "Elige cómo quieres bajar la montaña", "Choose how you want to ride the mountain")}
          />
        </Reveal>

        <div className="section-body grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {disciplines.map((d, i) => (
            <Reveal key={d.id} delay={i * 80}>
              <Link href={`/clases/${d.slug}`} className="card-interactive group block h-full overflow-hidden p-0">
                <div className="relative aspect-[16/10] overflow-hidden bg-hielo/5">
                  <Image
                    src={d.image}
                    alt={pickLocale(
                      locale,
                      `${d.nameEs} en Sierra Nevada`,
                      `${d.nameEn} in Sierra Nevada`,
                    )}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pizarra/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {pickLocale(locale, d.nameEs, d.nameEn)}
                    </h3>
                  </div>
                </div>
                <p className="p-4 text-sm text-muted line-clamp-2">
                  {pickLocale(locale, d.descriptionEs, d.descriptionEn)}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
