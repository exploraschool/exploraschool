import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-nieve text-pizarra">{children}</div>;
}
