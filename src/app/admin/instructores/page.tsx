import { AdminShell } from "@/components/admin/AdminShell";
import { InstructorAdminManager } from "@/components/admin/InstructorAdminManager";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { listInstructorsFromDb } from "@/lib/instructors-db";

export default async function AdminInstructoresPage() {
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
