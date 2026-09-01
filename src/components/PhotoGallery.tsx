import Image from "next/image";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";

type PhotoGalleryProps = {
  locale: string;
};

export function PhotoGallery({ locale }: PhotoGalleryProps) {
  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">{pickLocale(locale, "Galería", "Gallery")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Sierra Nevada, en directo", "Sierra Nevada, up close")}
          </h2>
          <p className="mt-4 text-muted">
            {pickLocale(
              locale,
              "Sustituiremos estas imágenes por fotos reales del equipo en cuanto el backup de la web esté disponible. Mientras tanto, explora nuestro Instagram.",
              "We will replace these with real team photos as soon as the website backup is available. Meanwhile, explore our Instagram.",
            )}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.gallery.map((item, i) => (
            <figure
              key={item.src}
              className={`relative overflow-hidden rounded-xl ${i === 0 ? "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto sm:min-h-[320px]" : "aspect-[4/3]"}`}
            >
              <Image
                src={item.src}
                alt={pickLocale(locale, item.altEs, item.altEn)}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
