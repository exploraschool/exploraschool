"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { adminCopy } from "@/lib/admin-copy";

export function AdminLogoutButton() {
  const router = useRouter();

  async function exitAdmin() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    } catch {
      /* still leave the panel */
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={exitAdmin}
      className="rounded-full border border-hielo/15 bg-white px-3.5 py-2 text-xs font-semibold text-pizarra transition hover:border-accent/30 hover:text-accent sm:text-sm"
    >
      {adminCopy.logout}
    </button>
  );
}
