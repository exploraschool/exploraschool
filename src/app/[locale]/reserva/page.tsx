import { setRequestLocale } from "next-intl/server";
import { BookingCheckout } from "@/components/cart/BookingCheckout";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/reserva",
    title: pickLocale(locale, "Reservar clases de esquí en Sierra Nevada", "Book ski lessons in Sierra Nevada"),
    description: pickLocale(
      locale,
      "Reserva clases de esquí, snowboard o telemark en Sierra Nevada. Elige fechas y personas y envía tu solicitud online a Explora School & Club.",
      "Book ski, snowboard or telemark lessons in Sierra Nevada. Choose dates and group size and send your request online to Explora School & Club.",
    ),
  });
}

export default async function ReservaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          {
            name: pickLocale(locale, "Reservar", "Book"),
            path: "/reserva",
          },
        ]}
      />
      <section className="section-padding pb-8 sm:pb-12">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <h1 className="page-title">
              {pickLocale(locale, "Tu reserva", "Your booking")}
            </h1>
            <p className="page-lead mt-3">
              {pickLocale(
                locale,
                "Revisa las clases, completa los datos y envía la solicitud.",
                "Review your lessons, fill in the details and send the request.",
              )}
            </p>
          </div>
          <BookingCheckout />
        </div>
      </section>
    </>
  );
}
