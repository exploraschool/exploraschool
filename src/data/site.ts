import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";
import { getSiteUrl } from "@/lib/site-url";

export type SocialLink = {
  platform: "instagram" | "facebook";
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

export type MeetingPoint = {
  name: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
};

export type SiteConfig = {
  name: string;
  legalName: string;
  domain: string;
  foundedYear: number;
  /** Año aproximado en que el equipo empezó a ejercer como instructores (antes de fundar Explora). */
  instructorExperienceSince: number;
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
  meetingPoint: MeetingPoint;
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
  instructorQualificationsEs: string;
  instructorQualificationsEn: string;
  instructorQualificationsShortEs: string;
  instructorQualificationsShortEn: string;
  heroLeadEs: string;
  heroLeadEn: string;
  aboutLeadEs: string;
  aboutLeadEn: string;
  homeMetaDescriptionEs: string;
  homeMetaDescriptionEn: string;
  rentalPartner: {
    name: string;
    discountPercent: number;
    locationEs: string;
    locationEn: string;
    howToFindEs: string;
    howToFindEn: string;
    blurbEs: string;
    blurbEn: string;
    googleMapsUrl: string;
  };
};

export const site: SiteConfig = {
  name: "Explora School & Club",
  legalName: "Explora School & Club",
  domain: getSiteUrl(),
  foundedYear: 2010,
  instructorExperienceSince: 2000,
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
  openingHours: "Lunes–Domingo 9:00–20:00",
  meetingPoint: {
    name: "Explora School & Club",
    latitude: 37.0711362,
    longitude: -3.3890244,
    googleMapsUrl:
      "https://www.google.com/maps/place/Explora+School+%26+Club/@37.0711362,-3.3890244,17z/data=!4m6!3m5!1s0xd71c39cb043a92b:0xe698582ffd83b140!8m2!3d37.0711362!4d-3.3890244!16s%2Fg%2F11v9j767kd?hl=es",
  },
  meetingPointEs:
    "Explora School & Club en la estación de esquí de Sierra Nevada — ubicación oficial en Google Maps. El/la instructor/a va con uniforme Explora. En día completo: recogida y entrega donde se solicite.",
  meetingPointEn:
    "Explora School & Club at Sierra Nevada ski resort — official location on Google Maps. Your instructor wears the Explora uniform. Full-Day: pick-up and drop-off on request.",
  nap: {
    name: "Explora School & Club",
    streetAddress: "Estación de esquí de Sierra Nevada, Borreguiles, Pradollano",
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
  ],
  tripAdvisor: {
    rating: 5.0,
    reviewCount: 18,
    url: "https://www.tripadvisor.es/Attraction_Review-g609099-d20368491-Reviews-Explora_School-Sierra_Nevada_Sierra_Nevada_National_Park_Province_of_Granada_And.html",
  },
  preseasonCopyEs: "10% DE DESCUENTO RESERVANDO ANTES DEL 1 DE NOVIEMBRE DE 2026",
  preseasonCopyEn: "10% OFF WHEN YOU BOOK BEFORE 1 NOVEMBER 2026",
  instructorQualificationsEs:
    "Licenciados INEF, TECO, TAFAD y titulados TD I, TD II y TD III",
  instructorQualificationsEn:
    "INEF, TECO, TAFAD and TD I, TD II and TD III certified instructors",
  instructorQualificationsShortEs: "TD I, II y III",
  instructorQualificationsShortEn: "TD I, II and III",
  heroLeadEs:
    "Instructores titulados con más de 20 años de experiencia. Explora desde 2010. Reserva online en minutos.",
  heroLeadEn:
    "Qualified instructors with over 20 years of experience. Explora since 2010. Book online in minutes.",
  aboutLeadEs:
    "Agrupación de instructores titulados con años de experiencia en la nieve. Explora School & Club desde 2010. Clases de 1 a 8 participantes y cursos en esquí, snowboard, telemark y más. Punto de encuentro en la estación de esquí de Sierra Nevada.",
  aboutLeadEn:
    "A group of qualified instructors with years of experience on the snow. Explora School & Club since 2010. Lessons for 1 to 8 participants and courses in ski, snowboard, telemark and more. Meeting point at Sierra Nevada ski resort.",
  homeMetaDescriptionEs:
    `Clases de esquí y snowboard baratas en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h en jornada completa. Instructores titulados, grupos de 1 a 8. Reserva online.`,
  homeMetaDescriptionEn:
    `Affordable ski and snowboard lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h on a full day. Qualified instructors, groups of 1 to 8. Book online.`,
  rentalPartner: {
    name: "José Luis Sáez",
    discountPercent: 20,
    locationEs:
      "Junto a los telecabinas Al-Andalus y Borreguiles, en Pradollano.",
    locationEn:
      "Next to the Al-Andalus and Borreguiles gondolas, in Pradollano.",
    howToFindEs:
      "En Pradollano, antes de subir a pistas: el alquiler de José Luis Sáez está junto a los telecabinas Al-Andalus y Borreguiles. Di que vienes de Explora para el 20% de descuento.",
    howToFindEn:
      "In Pradollano, before going up: José Luis Sáez rental is next to the Al-Andalus and Borreguiles gondolas. Say you are with Explora for 20% off.",
    blurbEs:
      "Recomendamos alquilar el material en José Luis Sáez (junto a los telecabinas Al-Andalus y Borreguiles). Con Explora obtienes un 20% de descuento: indícalo al recoger el equipo.",
    blurbEn:
      "We recommend renting equipment at José Luis Sáez (next to the Al-Andalus and Borreguiles gondolas). With Explora you get 20% off: mention it when you pick up your gear.",
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Jos%C3%A9+Luis+S%C3%A1ez+Alquiler+Esqu%C3%ADs+Plaza+de+Andaluc%C3%ADa+telecabinas+Al-Andalus+Borreguiles+Pradollano+Sierra+Nevada",
  },
};
