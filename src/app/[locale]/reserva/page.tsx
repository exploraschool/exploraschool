import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { BookingCheckout } from "@/components/cart/BookingCheckout";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
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
    <>
      <PageHeader
        eyebrow={pickLocale(locale, "Reservas", "Bookings")}
        title={pickLocale(locale, "Tu reserva", "Your booking")}
        description={pickLocale(
          locale,
          "Añade clases al carrito, elige fechas y envía tu solicitud. Te confirmaremos por email lo antes posible.",
          "Add lessons to your cart, pick dates and send your request. We will confirm by email as soon as possible.",
        )}
      />

      <section className="section-padding">
        <div className="container-page space-y-6">
          <EarlyBirdBanner locale={locale} />
          <BookingCheckout />
        </div>
      </section>
    </>
  );
}
