/** Central media paths — Sierra Nevada (Granada) photography in /images/stock/. */
export const media = {
  logo: "/images/logo-explora.png",
  logoMark: "/images/logo-mark.png",
  favicon: "/images/favicon.png",
  appleTouchIcon: "/images/apple-touch-icon.png",
  hero: "/images/stock/hero.jpg",
  heroPhoto: "/images/stock/hero.jpg",
  instructorsTeam: "/images/stock/team-backs.jpg",
  og: "/images/logo-512.png",
  gallery: [
    {
      src: "/images/stock/gallery-01.jpg",
      altEs: "Telesilla en Borreguiles, Sierra Nevada (Granada)",
      altEn: "Chairlift in Borreguiles, Sierra Nevada (Granada)",
    },
    {
      src: "/images/stock/gallery-02.jpg",
      altEs: "Pistas de esquí en Borreguiles, Sierra Nevada",
      altEn: "Ski slopes in Borreguiles, Sierra Nevada",
    },
    {
      src: "/images/stock/gallery-03.jpg",
      altEs: "Vista de Borreguiles, Sierra Nevada, Granada",
      altEn: "View of Borreguiles, Sierra Nevada, Granada",
    },
    {
      src: "/images/stock/gallery-04.jpg",
      altEs: "Panorámica de la estación de Sierra Nevada",
      altEn: "Panorama of Sierra Nevada ski resort",
    },
    {
      src: "/images/stock/gallery-05.jpg",
      altEs: "La Visera desde Borreguiles, Sierra Nevada",
      altEn: "La Visera peak from Borreguiles, Sierra Nevada",
    },
    {
      src: "/images/stock/gallery-06.jpg",
      altEs: "Telecabina de Borreguiles, Sierra Nevada (Granada)",
      altEn: "Borreguiles gondola, Sierra Nevada (Granada)",
    },
  ],
  video: {
    instagramProfile: "https://www.instagram.com/explora.school/",
    facebookPage: "https://www.facebook.com/sierranevadaclases/",
    poster: "/images/stock/video-poster.jpg",
  },
} as const;

export function instructorPhoto(slug: string): string {
  return `/images/instructors/${slug}.jpg`;
}
