import { cookies } from "next/headers";
import { ADMIN_PASSWORD_REQUIRED } from "@/lib/admin-auth-config";

export { ADMIN_PASSWORD_REQUIRED };
export const ADMIN_COOKIE = "explora_admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!ADMIN_PASSWORD_REQUIRED) return true;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  return token === hashSecret(secret);
}

export function hashSecret(secret: string): string {
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    hash = (hash << 5) - hash + secret.charCodeAt(i);
    hash |= 0;
  }
  return `explora_${Math.abs(hash).toString(36)}`;
}
