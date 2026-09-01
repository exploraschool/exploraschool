import { disciplines } from "@/data/disciplines";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CTASection } from "@/components/CTASection";
import { pickLocale } from "@/lib/locale";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ locale: string; discipline: string }> };

export async function generateStaticParams() {
  return disciplines.map((d) => ({ discipline: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, discipline: slug } = await params;
  const d = disciplines.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: `${pickLocale(locale, d.nameEs, d.nameEn)} | Explora School & Club`,
    description: pickLocale(locale, d.descriptionEs, d.descriptionEn),
  };
}

export default async function DisciplinePage({ params }: Props) {
  const { locale, discipline: slug } = await params;
  setRequestLocale(locale);
  const d = disciplines.find((x) => x.slug === slug);
  if (!d) notFound();

  const wa = buildWhatsAppUrl(
    pickLocale(
      locale,
      `¡Hola! Quiero reservar clases de ${d.nameEs} en Explora School`,
      `Hi! I'd like to book ${d.nameEn} lessons at Explora School`,
    ),
  );

  return (
    <>
      <section className="border-b border-hielo/10 bg-white py-16">
        <div className="container-page">
          <Link href={`/${locale}/clases`} className="text-sm text-accent hover:underline">
            ← {pickLocale(locale, "Todas las clases", "All lessons")}
          </Link>
          <h1 className="mt-4 font-display text-4xl font-semibold">
            {pickLocale(locale, d.nameEs, d.nameEn)}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            {pickLocale(locale, d.descriptionEs, d.descriptionEn)}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {pickLocale(locale, "Reservar por WhatsApp", "Book via WhatsApp")}
            </a>
            <Link href={`/${locale}/equipo`} className="btn-secondary">
              {pickLocale(locale, "Ver instructores", "View instructors")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page max-w-3xl text-muted">
          <p>
            {pickLocale(
              locale,
              "Clases particulares y grupales con instructores con nombre y cara. Punto de encuentro en Borreguiles, salida del telecabina Al-Andalus. Todos los precios con IVA incluido.",
              "Private and group lessons with named instructors. Meeting point at Borreguiles, Al-Andalus gondola exit. All prices include VAT.",
            )}
          </p>
        </div>
      </section>

      <CTASection locale={locale} />
    </>
  );
}
