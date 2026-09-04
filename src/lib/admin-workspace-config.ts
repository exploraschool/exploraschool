/** Cookie value for the Explora administration workspace (not an instructor). */
export const ADMIN_WORKSPACE_EXPLORA = "explora";

export function isExploraWorkspaceSlug(slug: string | null | undefined): boolean {
  return slug === ADMIN_WORKSPACE_EXPLORA;
}
