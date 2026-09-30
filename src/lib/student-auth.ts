import { cookies } from "next/headers";
import { isAllowedStaffEmail } from "@/lib/admin-auth";
import { getAdminAuth } from "@/lib/firebase/admin";
import { emailHasConfirmedBooking } from "@/lib/link-bookings";
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

/** Signed-in Google student, including someone who is still requesting a booking. */
export async function getStudentIdentity(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  if (!session) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (!decoded.email_verified || !decoded.email || !decoded.uid) return null;
    // Staff Google account must never resolve as a student session.
    if (isAllowedStaffEmail(decoded.email)) return null;
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

/** Student area: the same Google session, after Explora has accepted a booking. */
export async function getStudentSession(): Promise<StudentSession | null> {
  const student = await getStudentIdentity();
  if (!student) return null;
  if (!(await emailHasConfirmedBooking(student.email))) return null;
  return student;
}

export async function isStudentAuthenticated(): Promise<boolean> {
  return (await getStudentSession()) !== null;
}
