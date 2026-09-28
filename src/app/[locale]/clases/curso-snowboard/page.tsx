import type { Metadata } from "next";
import { ProductLanding, productLandingMetadata } from "@/components/ProductLanding";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return productLandingMetadata(locale, "curso-snow");
}

export default async function SnowboardCoursePage({ params }: Props) {
  const { locale } = await params;
  return <ProductLanding locale={locale} productId="curso-snow" />;
}
