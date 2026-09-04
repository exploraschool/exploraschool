import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media";
import { site } from "@/data/site";

type NotFoundViewProps = {
  /** When true, show brand mark (root 404 without site header). */
  showBrand?: boolean;
  homeHref?: string;
  clasesHref?: string;
};

export function NotFoundView({
  showBrand = true,
  homeHref = "/es",
  clasesHref = "/es/clases",
}: NotFoundViewProps) {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgb(181 221 214 / 0.28), transparent 60%), radial-gradient(ellipse 45% 40% at 100% 30%, rgb(234 91 94 / 0.07), transparent 55%)",
        }}
      />

      <div className="relative z-[1] flex max-w-lg flex-col items-center">
        {showBrand ? (
          <>
            <Image
              src={media.logo}
              alt={site.name}
              width={88}
              height={88}
              priority
              className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-sm sm:h-24 sm:w-24"
            />
            <p className="mt-5 font-display text-lg font-semibold tracking-tight text-hielo sm:text-xl">
              {site.name}
            </p>
          </>
        ) : null}

        <p className={`eyebrow ${showBrand ? "mt-8" : ""}`}>404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-hielo sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Esta pista no existe en Sierra Nevada. Vuelve al inicio o reserva una clase con{" "}
          {site.name}.
        </p>

        <div className="btn-stack mt-8 justify-center">
          <Link href={homeHref} className="btn-primary">
            Ir al inicio
          </Link>
          <Link href={clasesHref} className="btn-secondary">
            Ver clases
          </Link>
        </div>
      </div>
    </section>
  );
}
