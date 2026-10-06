import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { NotFoundView, notFoundPageMetadata } from "@/components/NotFoundView";
import { CartProvider } from "@/context/CartContext";

export async function generateMetadata(): Promise<Metadata> {
  return notFoundPageMetadata();
}

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="flex min-h-dvh min-w-0 max-w-full flex-col">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-dark focus:px-4 focus:py-2 focus:text-white"
          >
            {t("skipToContent")}
          </a>
          <Header locale={locale} />
          <main id="main-content" className="scroll-target min-w-0 flex-1 overflow-x-clip">
            <NotFoundView />
          </main>
          <Footer />
          <CookieBanner />
        </CartProvider>
      </NextIntlClientProvider>
    </div>
  );
}
