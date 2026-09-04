import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { InstructorAdminManager } from "@/components/admin/InstructorAdminManager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listInstructorsFromDb } from "@/lib/instructors-db";

export default async function AdminInstructoresPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const instructors = await listInstructorsFromDb();

  return (
    <AdminShell
      active="instructores"
      title="Gestión de instructores"
      description="Alta, foto, bio y disciplinas. Los perfiles aparecen en “¿Qué instructor eres hoy?” y en la asignación de reservas."
    >
      <InstructorAdminManager instructors={instructors} />
    </AdminShell>
  );
}
