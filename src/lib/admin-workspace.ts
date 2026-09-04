import { redirect } from "next/navigation";
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

export async function getAdminWorkspace(): Promise<AdminWorkspace | null> {
  const slug = await getSelectedInstructorSlug();
  if (!slug) return null;
  if (isExploraWorkspaceSlug(slug)) return { kind: "explora" };

  const instructor = await getInstructorFromDb(slug);
  if (!instructor || !instructor.active) return null;
  return { kind: "instructor", slug: instructor.slug, name: instructor.name };
}

export async function requireExploraWorkspace(): Promise<Extract<AdminWorkspace, { kind: "explora" }>> {
  const workspace = await getAdminWorkspace();
  if (!workspace) redirect("/admin/hoy");
  if (workspace.kind !== "explora") redirect("/admin/evaluacion");
  return workspace;
}

export async function requireInstructorWorkspace(): Promise<
  Extract<AdminWorkspace, { kind: "instructor" }>
> {
  const workspace = await getAdminWorkspace();
  if (!workspace) redirect("/admin/hoy");
  if (workspace.kind !== "instructor") redirect("/admin/reservas");
  return workspace;
}

/** Home route once a workspace is chosen. */
export function workspaceHome(workspace: AdminWorkspace): string {
  return workspace.kind === "explora" ? "/admin/reservas" : "/admin/evaluacion";
}
