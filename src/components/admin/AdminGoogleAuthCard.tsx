"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { ADMIN_GOOGLE_EMAIL } from "@/lib/admin-auth-config";
import { adminCopy, adminErrorMessage } from "@/lib/admin-copy";
import { media } from "@/lib/media";

type Phase = "ready" | "checking" | "connecting" | "verifying" | "success";

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3a7.2 7.2 0 0 1-10.78-3.8H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.62l4 3.09A7.14 7.14 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

function mapFirebaseCode(code: string): string {
  switch (code) {
    case "auth/unauthorized-domain":
      return adminCopy.errors.domainUnauthorized;
    case "auth/popup-blocked":
      return adminCopy.errors.popupBlocked;
    default:
      return adminCopy.errors.generic;
  }
}

function firebaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: string }).code);
  }
  return "";
}

/** GIS/COOP can reject the popup while Google still completes sign-in. */
function waitForSignedInUser(auth: Auth, timeoutMs: number): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe = () => {};

    const finish = (user: User | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      unsubscribe();
      resolve(user);
    };

    const timer = window.setTimeout(() => finish(auth.currentUser), timeoutMs);
    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) finish(user);
    });
  });
}

type AdminGoogleAuthCardProps = {
  onSuccess?: () => void;
  footer?: ReactNode;
  consumeRedirectOnMount?: boolean;
};

export function AdminGoogleAuthCard({
  onSuccess,
  footer,
  consumeRedirectOnMount = true,
}: AdminGoogleAuthCardProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>(consumeRedirectOnMount ? "checking" : "ready");

  async function establishSession(idToken: string) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;
    if (!res.ok) {
      throw new Error(adminErrorMessage(payload?.error, payload?.message));
    }
  }

  async function finishWithUser(getIdToken: () => Promise<string>, email?: string | null) {
    if (email && email.toLowerCase() !== ADMIN_GOOGLE_EMAIL.toLowerCase()) {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
      throw new Error(adminCopy.errors.unauthorizedEmail);
    }

    setPhase("verifying");
    const idToken = await getIdToken();
    await establishSession(idToken);
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setPhase("success");
    onSuccess?.();
    router.push("/admin/reservas");
    router.refresh();
  }

  useEffect(() => {
    if (!consumeRedirectOnMount) return;

    let cancelled = false;

    async function consumeRedirect() {
      const auth = getFirebaseAuth();
      if (!auth) {
        if (!cancelled) {
          setError(adminCopy.errors.firebaseMissing);
          setPhase("ready");
        }
        return;
      }

      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (!cancelled) setPhase("verifying");
          await finishWithUser(() => result.user.getIdToken(), result.user.email);
          return;
        }
      } catch (redirectError) {
        if (!cancelled) {
          setError(
            redirectError instanceof Error
              ? redirectError.message || adminCopy.errors.redirectRecover
              : adminCopy.errors.redirectRecover,
          );
        }
      } finally {
        if (!cancelled) setPhase((current) => (current === "checking" ? "ready" : current));
      }
    }

    void consumeRedirect();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumeRedirectOnMount]);

  async function handleGoogleSignIn() {
    setPhase("connecting");
    setError("");

    const auth = getFirebaseAuth();
    if (!auth) {
      setError(adminCopy.errors.firebaseMissing);
      setPhase("ready");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
      login_hint: ADMIN_GOOGLE_EMAIL,
    });
    provider.addScope("email");
    provider.addScope("profile");

    try {
      const result = await signInWithPopup(auth, provider);
      await finishWithUser(() => result.user.getIdToken(), result.user.email);
    } catch (popupError) {
      const code = firebaseErrorCode(popupError);

      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch {
          setError(adminCopy.errors.popupBlocked);
        }
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        const signedIn = await waitForSignedInUser(auth, 4000);
        if (signedIn) {
          try {
            await finishWithUser(() => signedIn.getIdToken(), signedIn.email);
            return;
          } catch (recoverError) {
            if (recoverError instanceof Error && recoverError.message.includes("permiso")) {
              setError(recoverError.message);
            } else {
              setError(mapFirebaseCode(firebaseErrorCode(recoverError)));
            }
            setPhase("ready");
            return;
          }
        }
        setError("");
      } else if (popupError instanceof Error && popupError.message.includes("permiso")) {
        setError(popupError.message);
      } else {
        setError(mapFirebaseCode(code));
      }
      setPhase("ready");
    }
  }

  const busy = phase === "checking" || phase === "connecting" || phase === "verifying" || phase === "success";
  const buttonLabel =
    phase === "checking"
      ? adminCopy.checkingSession
      : phase === "connecting"
        ? adminCopy.googleButtonLoading
        : phase === "verifying" || phase === "success"
          ? adminCopy.googleButtonVerifying
          : adminCopy.googleButton;

  return (
    <div className="overflow-hidden rounded-3xl border border-hielo/10 bg-white shadow-[0_24px_60px_rgba(14,14,15,0.12)]">
      <div className="border-b border-hielo/8 bg-gradient-to-r from-frost/40 via-white to-white px-5 py-5 text-center sm:px-6">
        <div className="inline-flex flex-col items-center gap-2.5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Image
              src={media.logo}
              alt={adminCopy.brand}
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold text-hielo sm:text-xl">
              {adminCopy.brand}
            </span>
            <span className="mt-0.5 block text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted">
              {adminCopy.panelName}
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        {phase === "success" ? (
          <div
            role="status"
            className="rounded-2xl border border-hielo/15 bg-hielo/5 px-4 py-3 text-center"
          >
            <p className="text-sm font-semibold text-hielo">{adminCopy.welcomeBack}</p>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-accent"
          >
            {error}
          </div>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={handleGoogleSignIn}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-hielo/15 bg-white px-5 py-3 text-sm font-semibold text-pizarra shadow-[0_6px_20px_rgba(14,14,15,0.06)] transition hover:border-hielo/30 hover:bg-nieve disabled:cursor-wait disabled:opacity-70"
        >
          <GoogleMark />
          <span>{buttonLabel}</span>
        </button>

        {footer}
      </div>
    </div>
  );
}
