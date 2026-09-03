import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7f7] px-4 text-center text-[#0e0e0f]">
        <Image
          src="/images/logo-explora.png"
          alt="Explora School & Club"
          width={96}
          height={96}
          className="h-24 w-24 object-contain"
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#5a9e94]">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#2d6b64]">Página no encontrada</h1>
        <p className="mt-4 max-w-md text-[#5c5c5e]">
          Esta pista no existe. Prueba con Clases y tarifas o vuelve al inicio.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/es"
            className="rounded-full bg-[#ea5b5e] px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al inicio
          </Link>
          <Link
            href="/es/clases"
            className="rounded-full border border-[#2d6b64]/20 bg-white px-6 py-3 text-sm font-semibold text-[#2d6b64]"
          >
            Ver clases
          </Link>
        </div>
      </body>
    </html>
  );
}
