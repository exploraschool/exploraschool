import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { InstructorPicker } from "@/components/instructor/InstructorPicker";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listInstructorsFromDb, getInstructorFromDb } from "@/lib/instructors-db";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";

export default async function AdminHoyPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const instructors = await listInstructorsFromDb();
  const selected = await getSelectedInstructorSlug();
  const current = selected ? await getInstructorFromDb(selected) : null;

  return (
    <AdminShell
      active="hoy"
      title="¿Qué instructor eres hoy?"
      description="Elige tu perfil para ver las clases y fichas de tus alumnos asignados. Puedes cambiar de perfil en cualquier momento."
    >
      {current ? (
        <p className="mb-5 rounded-2xl border border-hielo/15 bg-white px-4 py-3 text-sm">
          Perfil activo: <strong>{current.name}</strong> ·{" "}
          <Link href="/admin/evaluacion" className="font-semibold text-hielo hover:underline">
            Ir a evaluación
          </Link>
          {" · "}
          <Link href="/admin/reservas" className="font-semibold text-hielo hover:underline">
            Panel de administración
          </Link>
        </p>
      ) : (
        <p className="mb-5 text-sm text-muted">
          También puedes ir al{" "}
          <Link href="/admin/reservas" className="font-semibold text-hielo hover:underline">
            panel de administración
          </Link>{" "}
          sin elegir perfil.
        </p>
      )}
      <InstructorPicker instructors={instructors} />
    </AdminShell>
  );
}
