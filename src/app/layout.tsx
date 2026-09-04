import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { buildRootSpanishMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";
import { media } from "@/lib/media";
import "@/app/globals.css";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const spanishDefaults = buildRootSpanishMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f7f7",
};

export const metadata: Metadata = {
  ...spanishDefaults,
  metadataBase: new URL(getSiteUrl()),
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  icons: {
    icon: [
      { url: media.favicon, sizes: "48x48", type: "image/png" },
      { url: media.logoMark, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: media.appleTouchIcon, sizes: "180x180", type: "image/png" }],
    shortcut: media.favicon,
  },
};

type Props = {
  children: ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${fraunces.variable}`}
    >
      <body className="min-h-dvh bg-nieve text-pizarra antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
