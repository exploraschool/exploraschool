"use client";

import Link from "next/link";
import { AdminGoogleAuthCard } from "@/components/admin/AdminGoogleAuthCard";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { site } from "@/data/site";

export function AdminLoginForm() {
  useBodyScrollLock(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-nieve px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgb(181 221 214 / 0.35), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 10%, rgb(234 91 94 / 0.08), transparent 50%), linear-gradient(180deg, #ffffff 0%, #f6f7f7 100%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <AdminGoogleAuthCard
          footer={
            <div className="flex items-center justify-between gap-3 border-t border-hielo/8 pt-3 text-xs text-muted">
              <span>{site.name}</span>
              <Link href="/" className="font-semibold text-hielo hover:text-accent">
                Volver a la web
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
