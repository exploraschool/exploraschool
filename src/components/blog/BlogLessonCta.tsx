import Image from "next/image";
import Link from "next/link";
import type { BlogDisciplineCta } from "@/lib/blog-article";
import { localizedHref } from "@/lib/blog-article";
import { pickLocale } from "@/lib/locale";

export function BlogLessonCta({
  locale,
  discipline,
}: {
  locale: string;
  discipline: BlogDisciplineCta;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-hielo/12 bg-white shadow-[0_12px_32px_rgb(14_14_15_/_0.06)]">
      <div className="grid sm:grid-cols-[200px_1fr]">
        <div className="relative min-h-40 sm:min-h-full">
          <Image
            src={discipline.image}
            alt={pickLocale(locale, discipline.nameEs, discipline.nameEn)}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-hielo">
            {pickLocale(locale, "En la nieve con Explora", "On snow with Explora")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-pizarra">
            {pickLocale(
              locale,
              `¿Lo pruebas en clase de ${discipline.nameEs.toLowerCase()}?`,
              `Want to try it in a ${discipline.nameEn.toLowerCase()} lesson?`,
            )}
          </h2>
          <p className="mt-3 max-w-[65ch] text-[1.02rem] leading-relaxed text-muted">
            {pickLocale(locale, discipline.blurbEs, discipline.blurbEn)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href={localizedHref(locale, discipline.href)} className="btn-primary !w-auto">
              {pickLocale(locale, `Ver clases de ${discipline.nameEs.toLowerCase()}`, `See ${discipline.nameEn.toLowerCase()} lessons`)}
            </Link>
            <Link href={localizedHref(locale, "/reserva")} className="btn-secondary !w-auto">
              {pickLocale(locale, "Reservar en Sierra Nevada", "Book in Sierra Nevada")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
