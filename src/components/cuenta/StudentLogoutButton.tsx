"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function StudentLogoutButton({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations("account");

  async function logout() {
    await fetch("/api/cuenta/login", { method: "DELETE" });
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded-full border border-hielo/15 bg-white px-3.5 py-2 text-xs font-semibold text-pizarra hover:text-accent"
    >
      {t("logout")}
    </button>
  );
}
