import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedAdminEmail, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-auth-config";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { setHttpOnlyCookie, clearHttpOnlyCookie } from "@/lib/http-cookies";
import { isOnboardingComplete } from "@/lib/student-users";
import { upsertStudentProfile } from "@/lib/student-user-store";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE_MS,
} from "@/lib/student-auth-config";

export const runtime = "nodejs";

const bodySchema = z.object({
  idToken: z.string().min(20).max(4096),
  locale: z.enum(["es", "en"]).optional(),
});

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "firebase_missing", message: "Firebase Admin no configurado" },
      { status: 503 },
    );
  }

  const auth = getAdminAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "auth_unavailable", message: "Auth no disponible" },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "token_invalid", message: "Token inválido" },
      { status: 400 },
    );
  }

  try {
    const decoded = await auth.verifyIdToken(parsed.data.idToken, true);

    if (!decoded.email_verified || !decoded.email || !decoded.uid) {
      return NextResponse.json(
        { error: "unverified_email", message: "Email no verificado" },
        { status: 403 },
      );
    }

    // Corporate Explora account is never a student — always staff panel.
    if (isAllowedAdminEmail(decoded.email)) {
      const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
        expiresIn: ADMIN_SESSION_MAX_AGE_MS,
      });
      try {
        await auth.setCustomUserClaims(decoded.uid, { admin: true });
      } catch (claimError) {
        console.error("[cuenta/login] custom claims failed:", claimError);
      }
      await setHttpOnlyCookie(ADMIN_SESSION_COOKIE, sessionCookie);
      await clearHttpOnlyCookie(STUDENT_SESSION_COOKIE);
      return NextResponse.json({ ok: true, role: "staff", email: decoded.email });
    }

    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: STUDENT_SESSION_MAX_AGE_MS,
    });

    const profile = await upsertStudentProfile(decoded.uid, {
      email: decoded.email,
      displayName: typeof decoded.name === "string" ? decoded.name : "",
      photoURL: typeof decoded.picture === "string" ? decoded.picture : "",
      locale: parsed.data.locale ?? "es",
    });

    await setHttpOnlyCookie(STUDENT_SESSION_COOKIE, sessionCookie, STUDENT_SESSION_MAX_AGE_MS);
    await clearHttpOnlyCookie(ADMIN_SESSION_COOKIE);

    return NextResponse.json({
      ok: true,
      role: "student",
      email: decoded.email,
      onboardingComplete: isOnboardingComplete(profile),
      hasTakenClassesBefore: profile.hasTakenClassesBefore,
    });
  } catch (error) {
    console.error("[cuenta/login] Google session failed:", error);
    return NextResponse.json(
      { error: "verify_failed", message: "No se pudo verificar Google" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  await clearHttpOnlyCookie(STUDENT_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
