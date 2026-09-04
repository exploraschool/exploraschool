"use client";

import { useState } from "react";
import Image from "next/image";
import type { AffiliateProductImage } from "@/lib/affiliate-blog-shared";
import { pickLocale } from "@/lib/locale";

export function AffiliateProductGallery({
  images,
  locale,
  badge,
}: {
  images: AffiliateProductImage[];
  locale: string;
  badge?: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  if (!current) return <div className="aspect-square bg-nieve" />;

  return (
    <div className="space-y-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-nieve">
        <Image
          src={current.src}
          alt={pickLocale(locale, current.altEs, current.altEn)}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 360px"
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-hielo px-2.5 py-1 text-xs font-bold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      {pickLocale(locale, current.captionEs, current.captionEn) ? (
        <p className="px-1 text-xs text-muted">
          {pickLocale(locale, current.captionEs, current.captionEn)}
        </p>
      ) : null}
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white ${
                index === active ? "border-hielo ring-2 ring-hielo/30" : "border-hielo/15"
              }`}
              aria-label={pickLocale(locale, `Foto ${index + 1}`, `Photo ${index + 1}`)}
            >
              <Image
                src={image.src}
                alt=""
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
