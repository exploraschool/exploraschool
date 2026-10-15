"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pickLocale } from "@/lib/locale";
import type { LiveGalleryDisplayPhoto } from "@/lib/live-gallery-shared";

type LiveGalleryCarouselProps = {
  locale: string;
  photos: LiveGalleryDisplayPhoto[];
};

function GallerySlide({
  item,
  locale,
  decorative,
}: {
  item: LiveGalleryDisplayPhoto;
  locale: string;
  decorative?: boolean;
}) {
  const alt = decorative ? "" : pickLocale(locale, item.altEs, item.altEn);
  if (item.kind === "video") {
    return (
      <video
        src={item.src}
        className="h-full w-full object-cover"
        muted
        playsInline
        loop
        preload="none"
        aria-label={alt || undefined}
      />
    );
  }
  return (
    <Image
      src={item.src}
      alt={alt}
      fill
      className="object-cover"
      sizes="180px"
      unoptimized={item.src.includes("firebasestorage.googleapis.com")}
    />
  );
}

export function LiveGalleryCarousel({ locale, photos }: LiveGalleryCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReduceMotion(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;
    const carousel: HTMLDivElement = root;

    let inView = false;
    let scrolling = false;
    let settleTimer = 0;

    function apply() {
      const play = inView && !scrolling;
      carousel.classList.toggle("is-paused", !play);
      for (const video of carousel.querySelectorAll("video")) {
        if (play) void video.play().catch(() => undefined);
        else video.pause();
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        apply();
      },
      { rootMargin: "120px" },
    );
    observer.observe(root);

    function onScroll() {
      if (!scrolling) {
        scrolling = true;
        apply();
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        scrolling = false;
        apply();
      }, 160);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
    };
  }, [reduceMotion, photos]);

  if (photos.length === 0) return null;

  if (reduceMotion || photos.length === 1) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-4 sm:gap-3">
        {photos.map((item) => (
          <figure key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
            <GallerySlide item={item} locale={locale} />
          </figure>
        ))}
      </div>
    );
  }

  const base =
    photos.length >= 4
      ? photos
      : Array.from({ length: Math.ceil(4 / photos.length) }, () => photos).flat();
  const loop = [...base, ...base];
  const durationSec = Math.max(28, base.length * 4);

  return (
    <div
      ref={rootRef}
      className="live-gallery-carousel is-paused mt-6 sm:mt-8"
      role="region"
      aria-label={pickLocale(locale, "Galería de Sierra Nevada", "Sierra Nevada gallery")}
    >
      <div className="live-gallery-carousel__track" style={{ animationDuration: `${durationSec}s` }}>
        {loop.map((item, index) => (
          <figure
            key={`${item.id}-${index}`}
            className="live-gallery-carousel__slide relative aspect-square overflow-hidden rounded-xl"
            aria-hidden={index >= base.length}
          >
            <GallerySlide item={item} locale={locale} decorative={index >= base.length} />
          </figure>
        ))}
      </div>
    </div>
  );
}
