import { redirect } from "next/navigation";
import { requireAdminPanel } from "@/lib/admin-workspace";

export default async function AdminEvaluacionPage() {
  await requireAdminPanel();
  redirect("/admin/alumnos");
}
