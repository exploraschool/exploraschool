import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { InstructorAdminManager } from "@/components/admin/InstructorAdminManager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { listInstructorsFromDb } from "@/lib/instructors-db";

export default async function AdminInstructoresPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await requireAdminPanel();
  const instructors = await listInstructorsFromDb();

  return (
    <AdminShell
      active="instructores"
      title="Monitores"
      description="Alta, foto, bio y disciplinas. Estos perfiles se usan al entrar como monitor y al asignar reservas."
    >
      <InstructorAdminManager instructors={instructors} />
    </AdminShell>
  );
}
