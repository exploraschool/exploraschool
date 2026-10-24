import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { buildRootSpanishMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";
import { media } from "@/lib/media";
import "@/app/globals.css";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

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

/**
 * The root layout does not read the request. `<html>` lives in each branch
 * (`[locale]`, admin, and the root 404) so public pages can stay cached.
 */
export default function RootLayout({ children }: Props) {
  return children;
}
