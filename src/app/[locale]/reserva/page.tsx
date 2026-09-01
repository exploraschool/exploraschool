import { setRequestLocale } from "next-intl/server";
import { BookingCheckout } from "@/components/cart/BookingCheckout";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/reserva",
    title: pickLocale(locale, "Tu reserva", "Your booking"),
    description: pickLocale(
      locale,
      "Elige clases, fechas y personas. Envía tu reserva por email a Explora School & Club.",
      "Choose lessons, dates and group size. Send your booking by email to Explora School & Club.",
    ),
  });
}

export default async function ReservaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="section-padding pb-8 sm:pb-12">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <h1 className="page-title">{pickLocale(locale, "Tu reserva", "Your booking")}</h1>
          <p className="page-lead mt-3">
            {pickLocale(
              locale,
              "Revisa las clases añadidas, completa tus datos y envía la solicitud. Te confirmamos por email sin pago online.",
              "Review your lessons, fill in your details and send the request. We confirm by email with no online payment.",
            )}
          </p>
        </div>
        <BookingCheckout />
      </div>
    </section>
  );
}
