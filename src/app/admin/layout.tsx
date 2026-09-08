import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Admin | Explora School & Club" },
  description: "Panel de administración de Explora School.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-nieve text-pizarra">{children}</div>;
}
