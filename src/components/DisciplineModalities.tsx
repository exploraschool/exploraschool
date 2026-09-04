import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import {
  getModalitiesForParent,
  getModalityContent,
  type MainDisciplineId,
} from "@/data/disciplines";
import { pickLocale } from "@/lib/locale";

type DisciplineModalitiesProps = {
  locale: string;
  parentId: MainDisciplineId;
};

const sectionCopy: Record<
  "esqui" | "snowboard",
  { introEs: string; introEn: string; eyebrowEs: string; eyebrowEn: string }
> = {
  esqui: {
    eyebrowEs: "Más allá de la pista",
    eyebrowEn: "Beyond the groomers",
    introEs:
      "Además de las clases en pista, ofrecemos freeride y freestyle como estilos dentro del esquí alpino. Elige el tuyo al reservar o indícalo en las notas.",
    introEn:
      "Beyond piste lessons, we offer freeride and freestyle as styles within alpine skiing. Choose yours when booking or mention it in the notes.",
  },
  snowboard: {
    eyebrowEs: "Estilos dentro del snowboard",
    eyebrowEn: "Snowboard styles",
    introEs:
      "Snowpark, trucos y fuera de pista forman parte de nuestras clases de snowboard. Selecciona freestyle o freeride al hacer tu reserva.",
    introEn:
      "Snowpark, tricks and off-piste are part of our snowboard lessons. Select freestyle or freeride when making your booking.",
  },
};

export function DisciplineModalities({ locale, parentId }: DisciplineModalitiesProps) {
  const items = getModalitiesForParent(parentId);
  if (items.length === 0) return null;

  const copy = sectionCopy[parentId as "esqui" | "snowboard"];

  return (
    <section className="border-t border-hielo/8 bg-white py-10 sm:py-12 md:py-14">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow">{pickLocale(locale, copy.eyebrowEs, copy.eyebrowEn)}</p>
          <h2 className="section-title mt-2">
            {pickLocale(locale, "Freestyle y freeride", "Freestyle and freeride")}
          </h2>
          <p className="section-intro mt-3 max-w-2xl">
            {pickLocale(locale, copy.introEs, copy.introEn)}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6">
          {items.map((modality, i) => {
            const content = getModalityContent(modality, parentId, locale);

            return (
              <Reveal key={modality.id} delay={i * 80}>
                <article
                  id={modality.id}
                  className="card-interactive flex h-full flex-col overflow-hidden p-0 scroll-target"
                >
                  <div className="relative aspect-[16/9] bg-hielo/5">
                    <Image
                      src={modality.image}
                      alt={pickLocale(
                        locale,
                        `${modality.nameEs} en Sierra Nevada`,
                        `${modality.nameEn} in Sierra Nevada`,
                      )}
                      fill
                      className={modality.id === "freeride" ? "object-cover object-[center_45%]" : "object-cover"}
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pizarra/70 via-pizarra/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-oro px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-pizarra">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="font-display text-xl font-semibold text-white">
                        {pickLocale(locale, modality.nameEs, modality.nameEn)}
                      </h3>
                      {content.level && (
                        <p className="mt-1 text-xs text-on-dark-muted">{content.level}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-sm leading-relaxed text-muted">{content.description}</p>
                    {content.highlights.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {content.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2 text-sm text-pizarra">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-oro" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={160}>
          <p className="mt-6 rounded-xl border border-hielo/8 bg-nieve/80 px-4 py-3 text-center text-sm text-muted sm:mt-8">
            {pickLocale(
              locale,
              "¿Clase en pista sin modalidad específica? Reserva normalmente y lo indicamos como clase general.",
              "Piste lesson without a specific style? Book as usual and we'll treat it as a general lesson.",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
