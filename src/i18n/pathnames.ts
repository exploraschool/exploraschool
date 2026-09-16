export const pathnames = {
  "/": "/",
  "/clases": {
    es: "/clases",
    en: "/lessons",
  },
  "/tarifas": {
    es: "/tarifas",
    en: "/rates",
  },
  "/clases/esqui": {
    es: "/clases-de-esqui",
    en: "/ski-lessons",
  },
  "/clases/snowboard": {
    es: "/clases-de-snowboard",
    en: "/snowboard-lessons",
  },
  "/clases/telemark": {
    es: "/clases-de-telemark",
    en: "/telemark-lessons",
  },
  "/clases/esqui-adaptado": {
    es: "/clases-de-esqui-adaptado",
    en: "/adaptive-ski-lessons",
  },
  "/clases/ninos": {
    es: "/clases-para-ninos",
    en: "/kids-ski-lessons",
  },
  "/reserva": {
    es: "/reserva",
    en: "/book",
  },
  "/preguntas-frecuentes": {
    es: "/preguntas-frecuentes",
    en: "/faq",
  },
  "/como-llegar": {
    es: "/como-llegar-a-sierra-nevada",
    en: "/getting-to-sierra-nevada",
  },
  "/contacto": {
    es: "/contacto",
    en: "/contact",
  },
  "/club": "/club",
  "/blog": "/blog",
  "/blog/guias": {
    es: "/blog/guias",
    en: "/blog/guides",
  },
  "/blog/guias/[page]": {
    es: "/blog/guias/[page]",
    en: "/blog/guides/[page]",
  },
  "/blog/productos": {
    es: "/blog/productos",
    en: "/blog/gear",
  },
  "/blog/productos/[page]": {
    es: "/blog/productos/[page]",
    en: "/blog/gear/[page]",
  },
  "/blog/[slug]": "/blog/[slug]",
  "/cuenta": {
    es: "/cuenta",
    en: "/account",
  },
  "/cuenta/bienvenida": {
    es: "/cuenta/bienvenida",
    en: "/account/welcome",
  },
  "/aviso-legal": {
    es: "/aviso-legal",
    en: "/legal-notice",
  },
  "/politica-de-privacidad": {
    es: "/politica-de-privacidad",
    en: "/privacy-policy",
  },
  "/politica-de-cookies": {
    es: "/politica-de-cookies",
    en: "/cookie-policy",
  },
  "/equipo": "/equipo",
  "/equipo/[slug]": "/equipo/[slug]",
} as const;

export type AppPathname = keyof typeof pathnames;
