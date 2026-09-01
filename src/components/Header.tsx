import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media";
import { site } from "@/data/site";
import { HeaderNav } from "@/components/HeaderNav";

type HeaderProps = {
  locale: string;
};

export function Header({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-hielo/10 bg-nieve/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3">
          <Image
            src={media.logoMark}
            alt="Explora School & Club"
            width={40}
            height={40}
            className="h-9 w-9 md:h-10 md:w-10"
            priority
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-lg font-semibold text-pizarra">Explora</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-hielo">School & Club</span>
          </span>
        </Link>

        <HeaderNav locale={locale} />

        <a
          href={site.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary hidden shrink-0 text-xs sm:inline-flex sm:px-4 sm:py-2"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
