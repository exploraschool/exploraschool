import { redirect } from "next/navigation";
import { requireAdminPanel } from "@/lib/admin-workspace";

export default async function AdminHoyPage() {
  await requireAdminPanel();
  redirect("/admin/reservas");
}
