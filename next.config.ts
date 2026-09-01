import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const blogSlugs = [
  "guia-de-regalos",
  "guia-completa-de-material-de-alta-montana-crampones-mochilas-palas",
  "arva-pack-safety-box-evo4-seguridad-y-prevencion-en-la-nieve",
  "bastones-de-esqui-2025",
  "equipamiento-de-aventura-para-ninos",
  "las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada",
  "los-10-mejores-guantes-para-esquiar",
  "las-5-mejores-cremas-protectoras",
  "mejores-cascos-para-esqui-y-snowboard",
  "los-5-mejores-relojes-para-esqui-y-snowboard-en-2025",
  "las-mejores-chaquetas-de-esqui-y-snowboard-para-hombre-en-2025-guia-de-compra-completa",
  "por-que-es-necesario-contratar-clases-de-esqui-o-snowboard",
  "como-aprovechar-al-maximo-tu-tiempo-en-las-pistas-de-sierra-nevada-y-evitar-las-colas",
  "guia-completa-sobre-los-diferentes-tipos-de-esquis-y-cual-elegir-2025",
  "colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos",
  "mejora-tu-tecnica-de-snowboard-y-el-equipamiento-que-necesitas-2025",
  "aprende-a-esquiar-y-hacer-snowboard-con-explora-school-club-en-sierra-nevada",
  "los-mejores-accesorios-para-snowboard-en-2025-guia-completa",
  "los-mejores-guantes-para-esqui-y-snowboard-hestra-heli-ski",
  "10-trucos-secretos-para-dominar-el-snowboard-en-sierra-nevada-que-ni-los-expertos-conocen",
  "los-diferentes-tipos-de-tablas-de-snowboard-cual-es-la-ideal-para-ti-2025",
  "como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada",
  "plano-de-pistas-de-sierra-nevada",
  "gafas-fotocromaticas-para-deportes-de-nieve-y-montana-2025",
  "5-mejores-opciones-de-protector-labial",
  "guia-completa-sobre-cadenas-de-nieve-2025-seguridad-y-traccion",
  "consejos-primera-vez-sierra-nevada",
  "full-day-experiencia-explora",
];

const legacyRedirects = [
  { source: "/servicios", destination: "/clases", permanent: true },
  { source: "/tarifas", destination: "/clases", permanent: true },
  { source: "/cursos", destination: "/clases", permanent: true },
  { source: "/reserva-clases", destination: "/reserva", permanent: true },
  { source: "/equipo-explora", destination: "/clases", permanent: false },
  { source: "/nuestro-equipo", destination: "/clases", permanent: false },
  { source: "/equipo", destination: "/clases", permanent: false },
  { source: "/equipo/:slug", destination: "/clases", permanent: false },
  { source: "/faqs", destination: "/preguntas-frecuentes", permanent: true },
  { source: "/club-explora-en-sierra-nevada", destination: "/club", permanent: true },
  { source: "/clases/freeride-freestyle", destination: "/clases/esqui", permanent: true },
  { source: "/clases/freestyle", destination: "/clases/esqui#freestyle", permanent: true },
  { source: "/clases/freeride", destination: "/clases/esqui#freeride", permanent: true },
  ...blogSlugs.map((slug) => ({
    source: `/${slug}`,
    destination: "/blog",
    permanent: true,
  })),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "firebasestorage.googleapis.com" }],
  },
  async redirects() {
    return legacyRedirects.flatMap((r) => [
      r,
      { source: `/es${r.source}`, destination: `/es${r.destination}`, permanent: true },
      { source: `/en${r.source}`, destination: `/en${r.destination}`, permanent: true },
    ]);
  },
};

export default withNextIntl(nextConfig);
