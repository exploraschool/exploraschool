import type { ReactNode } from "react";
import { DM_Sans } from "next/font/google";
import "@/app/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-screen bg-nieve text-pizarra antialiased">{children}</body>
    </html>
  );
}
