import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-hielo">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-muted">
        Parece que esta pista no existe. Vuelve al inicio y reserva tu clase en Explora School & Club.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Volver al inicio
      </Link>
    </section>
  );
}
