import { cookies } from "next/headers";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE_MS,
} from "@/lib/student-auth-config";

export { STUDENT_SESSION_COOKIE, STUDENT_SESSION_MAX_AGE_MS };

export type StudentSession = {
  uid: string;
  email: string;
  name: string;
  picture: string;
};

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  if (!session) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (!decoded.email_verified || !decoded.email || !decoded.uid) return null;
    // Staff Google account must never resolve as a student session.
    if (isAllowedAdminEmail(decoded.email)) return null;
    return {
      uid: decoded.uid,
      email: String(decoded.email),
      name: typeof decoded.name === "string" ? decoded.name : "",
      picture: typeof decoded.picture === "string" ? decoded.picture : "",
    };
  } catch {
    return null;
  }
}

export async function isStudentAuthenticated(): Promise<boolean> {
  return (await getStudentSession()) !== null;
}
