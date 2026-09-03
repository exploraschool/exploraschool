import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-nieve text-pizarra antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
