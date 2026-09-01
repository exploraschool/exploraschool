import { disciplines } from "@/data/disciplines";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";

type DisciplinesGridProps = {
  locale: string;
};

export function DisciplinesGrid({ locale }: DisciplinesGridProps) {
  return (
    <section className="section-padding bg-nieve">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">{pickLocale(locale, "Modalidades", "Disciplines")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Elige cómo quieres bajar la montaña", "Choose how you want to ride the mountain")}
          </h2>
          <p className="mt-4 text-muted">
            {pickLocale(
              locale,
              "Esquí, Snowboard, Telemark, Esquí adaptado, Freestyle y Freeride. Descubre con nosotros todo lo que Sierra Nevada te ofrece.",
              "Ski, snowboard, telemark, adaptive skiing, freestyle and freeride. Discover everything Sierra Nevada has to offer with us.",
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d) => (
            <Link
              key={d.id}
              href={`/clases/${d.slug}`}
              className="card group block hover:border-accent/30 hover:shadow-lg transition"
            >
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-hielo/5">
                <Image
                  src={d.image}
                  alt={pickLocale(locale, d.nameEs, d.nameEn)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-hielo group-hover:text-accent">
                {pickLocale(locale, d.nameEs, d.nameEn)}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {pickLocale(locale, d.descriptionEs, d.descriptionEn)}
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-accent">
                {pickLocale(locale, "Ver clases →", "View lessons →")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
