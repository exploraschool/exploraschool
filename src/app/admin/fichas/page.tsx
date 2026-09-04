import { redirect } from "next/navigation";
import { requireAdminPanel } from "@/lib/admin-workspace";

/** Fichas live inside each alumno — keep URL for old links. */
export default async function AdminFichasPage() {
  await requireAdminPanel();
  redirect("/admin/alumnos");
}
