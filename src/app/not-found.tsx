import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: { absolute: "Página no encontrada | Explora School & Club" },
  description: "Esta página no existe. Vuelve al inicio o reserva una clase en Sierra Nevada.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return <NotFoundView showBrand />;
}
