import type { Metadata } from "next";
import { ProductLanding, productLandingMetadata } from "@/components/ProductLanding";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return productLandingMetadata(locale, "full-day");
}

export default async function FullDayPage({ params }: Props) {
  const { locale } = await params;
  return <ProductLanding locale={locale} productId="full-day" />;
}
