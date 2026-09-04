import { redirect } from "next/navigation";
import { getStaffSession, isAdminAuthenticated, staffHomePath } from "@/lib/admin-auth";
import { getInstructorFromDb } from "@/lib/instructors-db";
import { getSelectedInstructorSlug } from "@/lib/instructor-session";
import {
  ADMIN_WORKSPACE_EXPLORA,
  isExploraWorkspaceSlug,
} from "@/lib/admin-workspace-config";

export { ADMIN_WORKSPACE_EXPLORA, isExploraWorkspaceSlug };

export type AdminWorkspace =
  | { kind: "explora" }
  | { kind: "instructor"; slug: string; name: string };

/** Always treat authenticated staff as Explora panel (unified nav). */
export async function getAdminWorkspace(): Promise<AdminWorkspace | null> {
  if (!(await isAdminAuthenticated())) return null;

  const slug = await getSelectedInstructorSlug();
  if (slug && !isExploraWorkspaceSlug(slug)) {
    const instructor = await getInstructorFromDb(slug);
    if (instructor?.active) {
      return { kind: "instructor", slug: instructor.slug, name: instructor.name };
    }
  }
  return { kind: "explora" };
}

/** Full Explora admin only. Affiliate editors are sent to the blog studio. */
export async function requireAdminPanel(): Promise<AdminWorkspace> {
  const staff = await getStaffSession();
  if (!staff) redirect("/admin/login");
  if (staff.role !== "admin") redirect(staffHomePath(staff.role));
  const workspace = await getAdminWorkspace();
  return workspace ?? { kind: "explora" };
}

/** @deprecated Use requireAdminPanel — Explora is the only panel. */
export async function requireExploraWorkspace(): Promise<Extract<AdminWorkspace, { kind: "explora" }>> {
  await requireAdminPanel();
  return { kind: "explora" };
}

/** Monitor workspace removed; redirects to alumnos. */
export async function requireInstructorWorkspace(): Promise<never> {
  redirect("/admin/alumnos");
}

export function workspaceHome(_workspace?: AdminWorkspace | null): string {
  return "/admin/reservas";
}
