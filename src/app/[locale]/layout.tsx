import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { FaqChatWidget } from "@/components/FaqChatWidget";
import { JsonLd } from "@/components/JsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartProvider } from "@/context/CartContext";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="flex min-h-dvh min-w-0 max-w-full flex-col">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <CartProvider>
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-dark focus:px-4 focus:py-2 focus:text-white"
          >
            {t("skipToContent")}
          </a>
          <Header locale={locale} />
          <main id="main-content" className="scroll-target min-w-0 flex-1 overflow-x-clip">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <FaqChatWidget />
          <JsonLd locale={locale} />
        </CartProvider>
      </NextIntlClientProvider>
    </div>
  );
}
