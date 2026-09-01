import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FooterNavGroups } from "@/components/FooterNavGroups";
import { media } from "@/lib/media";
import { site } from "@/data/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();

  const sections = [
    {
      id: "explora",
      title: t("explora"),
      links: [
        { href: "/clases", label: nav("clases") },
        { href: "/reserva", label: nav("reservar") },
        { href: "/club", label: nav("club") },
        { href: "/blog", label: nav("blog") },
        { href: "/preguntas-frecuentes", label: nav("faqs") },
        { href: "/contacto", label: nav("contacto") },
        { href: "/como-llegar", label: t("comoLlegar") },
      ],
    },
    {
      id: "legal",
      title: t("legal"),
      links: [
        { href: "/aviso-legal", label: t("avisoLegal") },
        { href: "/politica-de-privacidad", label: t("privacidad") },
        { href: "/politica-de-cookies", label: t("cookies") },
      ],
      note: t("vat"),
      noteSecondary: t("cetursa"),
    },
    {
      id: "social",
      title: t("social"),
      links: site.social.map((s) => ({
        href: s.url,
        label: s.label,
        external: true,
      })),
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-pizarra text-nieve">
      <div className="container-page py-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Image
              src={media.logo}
              alt="Explora School & Club"
              width={96}
              height={96}
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                Explora School & Club
              </p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-oro-light">
                Sierra Nevada
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <a href={`tel:${site.phone}`} className="text-nieve/90 transition hover:text-oro-light">
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="text-nieve/80 transition hover:text-oro-light">
              {site.email}
            </a>
          </div>

          <FooterNavGroups sections={sections} />
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-white/10 pt-5 text-xs text-nieve/50">
          <p>© {year} {site.legalName}. {t("rights")}</p>
          <p>{t("since", { year: site.foundedYear })}</p>
        </div>
      </div>
    </footer>
  );
}
