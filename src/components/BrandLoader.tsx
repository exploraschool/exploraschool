import Image from "next/image";
import { media } from "@/lib/media";

type BrandLoaderProps = {
  /** Page-area loader vs compact inline. */
  variant?: "screen" | "inline";
  label?: string;
};

export function BrandLoader({
  variant = "screen",
  label = "Cargando",
}: BrandLoaderProps) {
  const mark = (
    <div className="brand-loader__stage" aria-hidden>
      <span className="brand-loader__glow" />
      <Image
        src={media.logo}
        alt=""
        width={160}
        height={160}
        priority
        className="brand-loader__logo"
      />
    </div>
  );

  return (
    <div
      className={`brand-loader brand-loader--${variant}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {mark}
      <span className="sr-only">{label}</span>
    </div>
  );
}
