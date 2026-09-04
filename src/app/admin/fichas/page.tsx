import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/** Fichas live inside each alumno — keep URL for old links. */
export default async function AdminFichasPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  redirect("/admin/alumnos");
}
