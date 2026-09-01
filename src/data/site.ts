import { getSiteUrl } from "@/lib/site-url";

export type SocialLink = {
  platform: "instagram" | "facebook" | "tripadvisor";
  label: string;
  url: string;
};

export type NapInfo = {
  name: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  telephone: string;
  email: string;
};

export type SiteConfig = {
  name: string;
  legalName: string;
  domain: string;
  foundedYear: number;
  taglineEs: string;
  taglineEn: string;
  languages: string[];
  vatIncluded: boolean;
  phone: string;
  phoneDisplay: string;
  email: string;
  whatsappUrl: string;
  whatsappPrefill: string;
  openingHours: string;
  meetingPointEs: string;
  meetingPointEn: string;
  nap: NapInfo;
  social: SocialLink[];
  tripAdvisor: {
    rating: number;
    reviewCount: number;
    url: string;
  };
  preseasonCopyEs: string;
  preseasonCopyEn: string;
};

export const site: SiteConfig = {
  name: "Explora School & Club",
  legalName: "Explora School & Club",
  domain: getSiteUrl(),
  foundedYear: 2010,
  taglineEs:
    "Tu escuela de esquí, snowboard y telemark en Sierra Nevada. Clases personalizadas y diversión garantizada en la nieve.",
  taglineEn:
    "Your ski, snowboard and telemark school in Sierra Nevada. Personalised lessons and guaranteed fun on the snow.",
  languages: ["es", "en"],
  vatIncluded: true,
  phone: "+34660262790",
  phoneDisplay: "+34 660 262 790",
  email: "explora.sclub@gmail.com",
  whatsappUrl:
    "https://api.whatsapp.com/send?phone=34660262790&text=%C2%A1Hola!%20Quiero%20reservar%20clases%20en%20Explora%20School",
  whatsappPrefill: "¡Hola! Quiero reservar clases en Explora School",
  openingHours: "Lunes–Domingo 9:00–18:00",
  meetingPointEs:
    "Salida del telecabina Al-Andalus, área de Borreguiles. El/la instructor/a va con uniforme. En Full-Day: recogida y entrega donde se solicite.",
  meetingPointEn:
    "Exit of the Al-Andalus gondola, Borreguiles area. Your instructor wears the Explora uniform. Full-Day: pick-up and drop-off on request.",
  nap: {
    name: "Explora School & Club",
    streetAddress: "Sierra Nevada",
    addressLocality: "Sierra Nevada",
    addressRegion: "Granada",
    postalCode: "18196",
    addressCountry: "ES",
    telephone: "+34 660 262 790",
    email: "explora.sclub@gmail.com",
  },
  social: [
    {
      platform: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/explora.school/",
    },
    {
      platform: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/sierranevadaclases/",
    },
    {
      platform: "tripadvisor",
      label: "TripAdvisor",
      url: "https://www.tripadvisor.es/Attraction_Review-g609099-d20368491-Reviews-Explora_School-Sierra_Nevada_Sierra_Nevada_National_Park_Province_of_Granada_And.html",
    },
  ],
  tripAdvisor: {
    rating: 5.0,
    reviewCount: 18,
    url: "https://www.tripadvisor.es/Attraction_Review-g609099-d20368491-Reviews-Explora_School-Sierra_Nevada_Sierra_Nevada_National_Park_Province_of_Granada_And.html",
  },
  preseasonCopyEs: "10% DE DESCUENTO RESERVANDO ANTES DEL 1 DE NOVIEMBRE",
  preseasonCopyEn: "10% OFF WHEN YOU BOOK BEFORE 1 NOVEMBER",
};
