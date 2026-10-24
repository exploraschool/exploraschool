import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

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

type Props = {
  lang: string;
  children: ReactNode;
};

/** Document shell. `lang` comes from the route segment, not from the request. */
export function DocumentShell({ lang, children }: Props) {
  return (
    <html
      lang={lang}
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
