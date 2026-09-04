import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminWorkspacePicker } from "@/components/admin/AdminWorkspacePicker";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import { listInstructorsFromDb } from "@/lib/instructors-db";

export default async function AdminHoyPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const instructors = await listInstructorsFromDb();
  const currentSlug = await getSelectedInstructorSlug();

  return (
    <AdminShell
      active="hoy"
      title="¿Cómo entras hoy?"
      description="Elige el panel de administración de Explora o tu perfil de monitor. Cada uno tiene su propio menú."
    >
      <AdminWorkspacePicker instructors={instructors} currentSlug={currentSlug} />
    </AdminShell>
  );
}
