"use client";

import { useRouter } from "next/navigation";
import { ADMIN_PASSWORD_REQUIRED } from "@/lib/admin-auth-config";

export function AdminLogoutButton() {
  const router = useRouter();

  async function exitAdmin() {
    if (ADMIN_PASSWORD_REQUIRED) {
      await fetch("/api/admin/login", { method: "DELETE" });
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={exitAdmin} className="btn-secondary text-sm">
      Salir del admin
    </button>
  );
}
