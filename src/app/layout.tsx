import { DM_Sans, Fraunces } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/data/site";
import "@/app/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  icons: {
    icon: "/images/logo-mark.svg",
    apple: "/images/logo-mark.svg",
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es" suppressHydrationWarning className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
