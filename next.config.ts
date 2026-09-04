import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Old WordPress/blog slugs → current post (or /blog / /clases when there is no equivalent). */
const legacyBlogRedirects: Record<string, string> = {
  "consejos-primera-vez-sierra-nevada": "/blog/consejos-primera-vez-sierra-nevada",
  "por-que-es-necesario-contratar-clases-de-esqui-o-snowboard":
    "/blog/por-que-contratar-clases-esqui-snowboard",
  "las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada":
    "/blog/como-elegir-gafas-esqui-snowboard",
  "guia-completa-sobre-los-diferentes-tipos-de-esquis-y-cual-elegir-2025":
    "/blog/esqui-o-snowboard-cual-elegir",
  "como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada":
    "/blog/que-llevar-primer-dia-nieve",
  "colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos":
    "/blog/como-llegar-sierra-nevada-guia",
  "full-day-experiencia-explora": "/clases",
  "guia-de-regalos": "/blog",
  "guia-completa-de-material-de-alta-montana-crampones-mochilas-palas": "/blog",
  "arva-pack-safety-box-evo4-seguridad-y-prevencion-en-la-nieve": "/blog",
  "bastones-de-esqui-2025": "/blog",
  "equipamiento-de-aventura-para-ninos": "/blog",
  "los-10-mejores-guantes-para-esquiar": "/blog",
  "las-5-mejores-cremas-protectoras": "/blog",
  "mejores-cascos-para-esqui-y-snowboard": "/blog",
  "los-5-mejores-relojes-para-esqui-y-snowboard-en-2025": "/blog",
  "las-mejores-chaquetas-de-esqui-y-snowboard-para-hombre-en-2025-guia-de-compra-completa":
    "/blog",
  "como-aprovechar-al-maximo-tu-tiempo-en-las-pistas-de-sierra-nevada-y-evitar-las-colas":
    "/blog",
  "mejora-tu-tecnica-de-snowboard-y-el-equipamiento-que-necesitas-2025": "/blog",
  "aprende-a-esquiar-y-hacer-snowboard-con-explora-school-club-en-sierra-nevada":
    "/blog",
  "los-mejores-accesorios-para-snowboard-en-2025-guia-completa": "/blog",
  "los-mejores-guantes-para-esqui-y-snowboard-hestra-heli-ski": "/blog",
  "10-trucos-secretos-para-dominar-el-snowboard-en-sierra-nevada-que-ni-los-expertos-conocen":
    "/blog",
  "los-diferentes-tipos-de-tablas-de-snowboard-cual-es-la-ideal-para-ti-2025": "/blog",
  "plano-de-pistas-de-sierra-nevada": "/blog",
  "gafas-fotocromaticas-para-deportes-de-nieve-y-montana-2025": "/blog",
  "5-mejores-opciones-de-protector-labial": "/blog",
  "guia-completa-sobre-cadenas-de-nieve-2025-seguridad-y-traccion": "/blog",
};

const legacyRedirects = [
  { source: "/servicios", destination: "/clases", permanent: true },
  { source: "/tarifas", destination: "/clases", permanent: true },
  { source: "/cursos", destination: "/clases", permanent: true },
  { source: "/reserva-clases", destination: "/reserva", permanent: true },
  { source: "/equipo-explora", destination: "/clases", permanent: true },
  { source: "/nuestro-equipo", destination: "/clases", permanent: true },
  { source: "/equipo", destination: "/clases", permanent: true },
  { source: "/equipo/:slug", destination: "/clases", permanent: true },
  { source: "/faqs", destination: "/preguntas-frecuentes", permanent: true },
  { source: "/club-explora-en-sierra-nevada", destination: "/club", permanent: true },
  { source: "/clases/freeride-freestyle", destination: "/clases/esqui", permanent: true },
  { source: "/clases/freestyle", destination: "/clases/esqui#freestyle", permanent: true },
  { source: "/clases/freeride", destination: "/clases/esqui#freeride", permanent: true },
  ...Object.entries(legacyBlogRedirects).map(([slug, destination]) => ({
    source: `/${slug}`,
    destination,
    permanent: true,
  })),
];

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
      { protocol: "https", hostname: "images-eu.ssl-images-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
  async redirects() {
    return legacyRedirects.flatMap((r) => [
      r,
      { source: `/es${r.source}`, destination: `/es${r.destination}`, permanent: true },
      { source: `/en${r.source}`, destination: `/en${r.destination}`, permanent: true },
    ]);
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
