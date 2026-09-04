import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  getStaffRole,
  isAllowedStaffEmail,
  staffCustomClaims,
  staffHomePath,
} from "@/lib/admin-auth";
import { ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-auth-config";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";

const bodySchema = z.object({
  idToken: z.string().min(20).max(4096),
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

    if (!decoded.email_verified) {
      return NextResponse.json(
        { error: "unverified_email", message: "Email no verificado" },
        { status: 403 },
      );
    }

    const role = getStaffRole(decoded.email);
    if (!role || !isAllowedStaffEmail(decoded.email)) {
      return NextResponse.json(
        { error: "unauthorized_email", message: "Cuenta no autorizada" },
        { status: 403 },
      );
    }

    try {
      await auth.setCustomUserClaims(decoded.uid, staffCustomClaims(role));
    } catch (claimError) {
      console.error("[admin/login] custom claims failed:", claimError);
    }

    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000),
    });

    return NextResponse.json({
      ok: true,
      email: decoded.email,
      role: "staff",
      staffRole: role,
      homePath: staffHomePath(role),
    });
  } catch (error) {
    console.error("[admin/login] Google session failed:", error);
    return NextResponse.json(
      { error: "verify_failed", message: "No se pudo verificar Google" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete("explora_instructor_slug");
  return NextResponse.json({ ok: true });
}
