import Image from "next/image";
import { disciplines } from "@/data/disciplines";
import { pickLocale } from "@/lib/locale";

type DisciplinesGridProps = {
  locale: string;
};

export function DisciplinesGrid({ locale }: DisciplinesGridProps) {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">{pickLocale(locale, "Modalidades", "Disciplines")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Esquí, snowboard y más", "Ski, snowboard and more")}
          </h2>
          <p className="mt-4 text-muted">
            {pickLocale(
              locale,
              "En Explora School & Club puedes encontrar clases de Esquí, Snowboard, Telemark, Esquí adaptado, Freestyle y Freeride. Descubre con nosotros todo lo que Sierra Nevada te ofrece.",
              "At Explora School & Club you will find ski, snowboard, telemark, adaptive skiing, freestyle and freeride lessons. Discover everything Sierra Nevada has to offer with us.",
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d) => (
            <article key={d.id} className="card group hover:border-hielo/25 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-nieve">
                  <Image
                    src={d.image}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-hielo">
                    {pickLocale(locale, d.nameEs, d.nameEn)}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {pickLocale(locale, d.descriptionEs, d.descriptionEn)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
