import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Keep in sync with `CANONICAL_HOST` in `src/lib/site-url.ts`. */
const CANONICAL_ORIGIN = "https://www.explora-school.es";
const LEGACY_HOSTS = [
  "sierranevadaclases.es",
  "www.sierranevadaclases.es",
  "explora-school.es",
] as const;

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: "host"; value: string }[];
};

type LegacyRedirect = {
  source: string;
  destination: string;
  destinationEn?: string;
};

/** Absolute destinations on Vercel production so old hosts 308 in a single hop. */
function canonicalize(destination: string): string {
  if (process.env.VERCEL_ENV !== "production") return destination;
  if (/^https?:\/\//.test(destination)) return destination;
  return `${CANONICAL_ORIGIN}${destination}`;
}

function withTrailingSlash(redirects: Redirect[]): Redirect[] {
  return redirects.flatMap((r) => {
    if (r.source === "/" || r.source.endsWith("/") || r.source.endsWith("*")) {
      return [r];
    }
    return [r, { ...r, source: `${r.source}/` }];
  });
}

function finalize(redirects: Redirect[]): Redirect[] {
  return withTrailingSlash(redirects).map((r) => ({
    ...r,
    destination: canonicalize(r.destination),
  }));
}

/** Old WordPress/blog slugs → current post (or /blog / /clases when there is no equivalent). */
const legacyBlogRedirects: Record<string, string> = {
  "consejos-primera-vez-sierra-nevada": "/blog/primera-vez-esqui-sierra-nevada",
  "por-que-es-necesario-contratar-clases-de-esqui-o-snowboard":
    "/blog/por-que-contratar-clases-esqui-snowboard",
  "las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada":
    "/blog/gafas-esqui-snowboard-sierra-nevada",
  "guia-completa-sobre-los-diferentes-tipos-de-esquis-y-cual-elegir-2025":
    "/blog",
  "como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada":
    "/blog/que-llevar-esqui-sierra-nevada",
  "colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos":
    "/como-llegar-a-sierra-nevada",
  "full-day-experiencia-explora": "/blog/que-tipo-clases-elegir-sierra-nevada",
  "guia-de-regalos": "/blog",
  "guia-completa-de-material-de-alta-montana-crampones-mochilas-palas": "/blog/productos",
  "arva-pack-safety-box-evo4-seguridad-y-prevencion-en-la-nieve": "/blog/productos",
  "bastones-de-esqui-2025": "/blog/productos",
  "equipamiento-de-aventura-para-ninos": "/blog/productos",
  "los-10-mejores-guantes-para-esquiar": "/blog/productos",
  "las-5-mejores-cremas-protectoras": "/blog/productos",
  "mejores-cascos-para-esqui-y-snowboard": "/blog/productos",
  "los-5-mejores-relojes-para-esqui-y-snowboard-en-2025": "/blog/productos",
  "las-mejores-chaquetas-de-esqui-y-snowboard-para-hombre-en-2025-guia-de-compra-completa":
    "/blog/productos",
  "como-aprovechar-al-maximo-tu-tiempo-en-las-pistas-de-sierra-nevada-y-evitar-las-colas":
    "/blog",
  "mejora-tu-tecnica-de-snowboard-y-el-equipamiento-que-necesitas-2025": "/blog",
  "aprende-a-esquiar-y-hacer-snowboard-con-explora-school-club-en-sierra-nevada":
    "/blog",
  "los-mejores-accesorios-para-snowboard-en-2025-guia-completa": "/blog/productos",
  "los-mejores-guantes-para-esqui-y-snowboard-hestra-heli-ski": "/blog/productos",
  "10-trucos-secretos-para-dominar-el-snowboard-en-sierra-nevada-que-ni-los-expertos-conocen":
    "/blog",
  "los-diferentes-tipos-de-tablas-de-snowboard-cual-es-la-ideal-para-ti-2025": "/blog",
  "plano-de-pistas-de-sierra-nevada": "/blog",
  "gafas-fotocromaticas-para-deportes-de-nieve-y-montana-2025":
    "/blog/gafas-esqui-snowboard-sierra-nevada",
  "5-mejores-opciones-de-protector-labial": "/blog/productos",
  "guia-completa-sobre-cadenas-de-nieve-2025-seguridad-y-traccion": "/blog/productos",
};

const disciplineRedirects = [
  { from: "esqui", toEs: "/clases-de-esqui", toEn: "/en/ski-lessons" },
  { from: "snowboard", toEs: "/clases-de-snowboard", toEn: "/en/snowboard-lessons" },
  { from: "telemark", toEs: "/clases-de-telemark", toEn: "/en/telemark-lessons" },
  { from: "esqui-adaptado", toEs: "/clases-de-esqui-adaptado", toEn: "/en/adaptive-ski-lessons" },
  { from: "ninos", toEs: "/clases-para-ninos", toEn: "/en/kids-ski-lessons" },
];

const seoRedirects: Redirect[] = [
  { source: "/es", destination: "/", permanent: true },
  ...disciplineRedirects.flatMap((d) => [
    { source: `/clases/${d.from}`, destination: d.toEs, permanent: true },
    { source: `/es/clases/${d.from}`, destination: d.toEs, permanent: true },
    { source: `/en/clases/${d.from}`, destination: d.toEn, permanent: true },
  ]),
  { source: "/en/clases", destination: "/en/lessons", permanent: true },
  { source: "/es/clases", destination: "/clases", permanent: true },
  { source: "/como-llegar", destination: "/como-llegar-a-sierra-nevada", permanent: true },
  { source: "/es/como-llegar", destination: "/como-llegar-a-sierra-nevada", permanent: true },
  { source: "/en/como-llegar", destination: "/en/getting-to-sierra-nevada", permanent: true },
  { source: "/en/preguntas-frecuentes", destination: "/en/faq", permanent: true },
  { source: "/en/reserva", destination: "/en/book", permanent: true },
  { source: "/en/contacto", destination: "/en/contact", permanent: true },
  { source: "/en/aviso-legal", destination: "/en/legal-notice", permanent: true },
  { source: "/en/politica-de-privacidad", destination: "/en/privacy-policy", permanent: true },
  { source: "/en/politica-de-cookies", destination: "/en/cookie-policy", permanent: true },
  { source: "/en/cuenta", destination: "/en/account", permanent: true },
  { source: "/en/cuenta/bienvenida", destination: "/en/account/welcome", permanent: true },
  { source: "/clases/freeride-freestyle", destination: "/clases-de-esqui", permanent: true },
  { source: "/clases/freestyle", destination: "/clases-de-esqui#freestyle", permanent: true },
  { source: "/clases/freeride", destination: "/clases-de-esqui#freeride", permanent: true },
  { source: "/es/clases/freeride-freestyle", destination: "/clases-de-esqui", permanent: true },
  { source: "/es/clases/freestyle", destination: "/clases-de-esqui#freestyle", permanent: true },
  { source: "/es/clases/freeride", destination: "/clases-de-esqui#freeride", permanent: true },
  { source: "/en/clases/freeride-freestyle", destination: "/en/ski-lessons", permanent: true },
  { source: "/en/clases/freestyle", destination: "/en/ski-lessons#freestyle", permanent: true },
  { source: "/en/clases/freeride", destination: "/en/ski-lessons#freeride", permanent: true },
  {
    source: "/blog/consejos-primera-vez-sierra-nevada",
    destination: "/blog/primera-vez-esqui-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/esqui-o-snowboard-cual-elegir",
    destination: "/blog/esqui-o-snowboard-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/normas-seguridad-pista-esqui",
    destination: "/blog/seguridad-esqui-snowboard-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/que-llevar-primer-dia-nieve",
    destination: "/blog/que-llevar-esqui-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/como-elegir-gafas-esqui-snowboard",
    destination: "/blog/gafas-esqui-snowboard-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/freeride-freestyle-telemark-sierra-nevada",
    destination: "/blog/freeride-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/club-creando-aventuras-jovenes-sierra-nevada",
    destination: "/club",
    permanent: true,
  },
  {
    source: "/blog/como-llegar-sierra-nevada-guia",
    destination: "/como-llegar-a-sierra-nevada",
    permanent: true,
  },
  {
    source: "/blog/esqui-adaptado-sierra-nevada",
    destination: "/clases-de-esqui-adaptado",
    permanent: true,
  },
];

const legacyRedirects: LegacyRedirect[] = [
  { source: "/servicios", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/tarifas", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/cursos", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/reserva-clases", destination: "/reserva", destinationEn: "/en/book" },
  { source: "/reservas", destination: "/reserva", destinationEn: "/en/book" },
  { source: "/politica-privacidad", destination: "/politica-de-privacidad", destinationEn: "/en/privacy-policy" },
  { source: "/equipo-explora", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/nuestro-equipo", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/equipo", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/equipo/:slug", destination: "/clases", destinationEn: "/en/lessons" },
  { source: "/faqs", destination: "/preguntas-frecuentes", destinationEn: "/en/faq" },
  { source: "/club-explora-en-sierra-nevada", destination: "/club", destinationEn: "/club" },
  ...Object.entries(legacyBlogRedirects).map(([slug, destination]) => ({
    source: `/${slug}`,
    destination,
  })),
];

const pathRedirects: Redirect[] = [
  ...seoRedirects,
  ...legacyRedirects.flatMap((r) => [
    { source: r.source, destination: r.destination, permanent: true as const },
    { source: `/es${r.source}`, destination: r.destination, permanent: true as const },
    {
      source: `/en${r.source}`,
      destination: r.destinationEn ?? `/en${r.destination}`,
      permanent: true as const,
    },
  ]),
  { source: "/es/:path*", destination: "/:path*", permanent: true as const },
];

const legacyHostRedirects: Redirect[] = LEGACY_HOSTS.flatMap((host) => [
  {
    source: "/",
    has: [{ type: "host" as const, value: host }],
    destination: `${CANONICAL_ORIGIN}/`,
    permanent: true as const,
  },
  {
    source: "/:path*",
    has: [{ type: "host" as const, value: host }],
    destination: `${CANONICAL_ORIGIN}/:path*`,
    permanent: true as const,
  },
]);

const firebaseHostingDomain =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`
    : "exploraschool-9ea82.firebaseapp.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "**.media-amazon.com" },
      { protocol: "https", hostname: "images-eu.ssl-images-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "**.ssl-images-amazon.com" },
    ],
  },
  async redirects() {
    return [...finalize(pathRedirects), ...legacyHostRedirects];
  },
  // Proxy Firebase Auth handler so authDomain can be www.explora-school.es
  // (Google then shows that domain instead of *.firebaseapp.com).
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseHostingDomain}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/init.json",
        destination: `https://${firebaseHostingDomain}/__/firebase/init.json`,
      },
    ];
  },
  // Google Identity / Firebase popup auth polls window.closed and then
  // window.close. COOP: same-origin (or a missing explicit policy in Chrome)
  // isolates the opener from that popup and aborts sign-in.
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
