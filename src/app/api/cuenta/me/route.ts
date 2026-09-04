import { NextResponse } from "next/server";
import { getStaffSession, staffHomePath } from "@/lib/admin-auth";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { isOnboardingComplete } from "@/lib/student-users";

export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffSession();
  if (staff) {
    return NextResponse.json({
      user: null,
      role: "staff",
      staffRole: staff.role,
      homePath: staffHomePath(staff.role),
    });
  }

  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const profile = await getStudentProfile(session.uid);
  return NextResponse.json({
    user: {
      uid: session.uid,
      email: session.email,
      displayName: profile?.displayName || session.name,
      photoURL: profile?.photoURL || session.picture,
      phone: profile?.phone || "",
      onboardingComplete: profile ? isOnboardingComplete(profile) : false,
    },
  });
}
