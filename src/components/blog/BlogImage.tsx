"use client";

import Image, { type ImageProps } from "next/image";

export function isRemoteImageSrc(src: ImageProps["src"]): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** Remote blog photos (Amazon CDN, Firebase) skip the optimizer — Vercel returns 402 for those URLs. */
export function BlogImage({ src, alt, unoptimized, ...props }: ImageProps) {
  if (!src || (typeof src === "string" && !src.trim())) return null;
  return (
    <Image
      alt={alt}
      {...props}
      src={src}
      unoptimized={unoptimized ?? isRemoteImageSrc(src)}
    />
  );
}
