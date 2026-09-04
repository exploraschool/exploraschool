/** Central media paths — Sierra Nevada (Granada) photography in /images/stock/. */
export const media = {
  logo: "/images/logo-explora.png",
  logoEmail: "/images/logo-email.png",
  logoMark: "/images/logo-mark.png",
  favicon: "/images/favicon.png",
  appleTouchIcon: "/images/apple-touch-icon.png",
  hero: "/images/stock/hero.jpg",
  heroPhoto: "/images/stock/hero.jpg",
  clasesHero: {
    src: "/images/stock/clases-hero.jpg",
    altEs: "Estación de esquí de Sierra Nevada en Borreguiles, con pistas y telesilla",
    altEn: "Sierra Nevada ski resort at Borreguiles, with slopes and a chairlift",
  },
  instructorsTeam: "/images/stock/team-backs.jpg",
  og: "/images/stock/hero.jpg",
  clubAbout: {
    src: "/images/stock/club-about.jpg",
    altEs: "Esquís y material de nieve en la montaña",
    altEn: "Skis and snow gear in the mountains",
  },
  gallery: [
    {
      src: "/images/stock/gallery-01.jpg",
      altEs: "Telesilla en la estación de esquí de Sierra Nevada (Granada)",
      altEn: "Chairlift at Sierra Nevada ski resort (Granada)",
    },
    {
      src: "/images/stock/gallery-02.jpg",
      altEs: "Pistas de esquí en la estación de Sierra Nevada",
      altEn: "Ski slopes at Sierra Nevada ski resort",
    },
    {
      src: "/images/stock/gallery-03.jpg",
      altEs: "Vista de la estación de esquí de Sierra Nevada, Granada",
      altEn: "View of Sierra Nevada ski resort, Granada",
    },
    {
      src: "/images/stock/gallery-04-panorama.jpg",
      altEs: "Panorámica de la estación de esquí de Sierra Nevada",
      altEn: "Panorama of Sierra Nevada ski resort",
    },
    {
      src: "/images/stock/gallery-05.jpg",
      altEs: "Esquí fuera de pista en la estación de Sierra Nevada",
      altEn: "Off-piste skiing at Sierra Nevada ski resort",
    },
    {
      src: "/images/stock/gallery-06-gondola.jpg",
      altEs: "Subida en telecabina a la estación de Sierra Nevada",
      altEn: "Gondola ride up to Sierra Nevada ski resort",
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
