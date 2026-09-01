/** Central media paths — swap to /images/legacy/* when assets are uploaded. */
export const media = {
  logo: "/images/logo-explora.svg",
  logoMark: "/images/logo-mark.svg",
  hero: "/images/hero-sierra-nevada.svg",
  heroPhoto: "/images/legacy/hero-alumnos-instructores.jpg",
  instructorsTeam: "/images/legacy/instructores-espaldas.jpg",
  og: "/images/og-explora.svg",
  gallery: [
    { src: "/images/gallery-01.svg", altEs: "Clase de esquí en Borreguiles, Sierra Nevada", altEn: "Ski lesson in Borreguiles, Sierra Nevada" },
    { src: "/images/gallery-02.svg", altEs: "Snowboard en Sierra Nevada con Explora School", altEn: "Snowboard in Sierra Nevada with Explora School" },
    { src: "/images/gallery-03.svg", altEs: "Instructores Explora en pista", altEn: "Explora instructors on the slopes" },
    { src: "/images/gallery-04.svg", altEs: "Telecabina Al-Andalus, punto de encuentro", altEn: "Al-Andalus gondola, meeting point" },
  ],
  video: {
    instagramProfile: "https://www.instagram.com/explora.school/",
    facebookPage: "https://www.facebook.com/sierranevadaclases/",
    poster: "/images/video-poster.svg",
  },
} as const;

export function instructorPhoto(slug: string): string {
  return `/images/instructors/${slug}.svg`;
}
