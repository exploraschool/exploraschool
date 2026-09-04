"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isAllowedStaffEmail } from "@/lib/admin-auth-config";
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

export type GoogleAuthSuccess = {
  role?: "staff" | "student";
  staffRole?: "admin" | "affiliate_editor";
  homePath?: string;
  onboardingComplete?: boolean;
  email?: string;
};

type GoogleAuthCardProps = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  loginEndpoint: string;
  locale?: string;
  allowAnyAccount?: boolean;
  loginHint?: string;
  unauthorizedMessage: string;
  firebaseMissing: string;
  popupBlocked: string;
  genericError: string;
  domainUnauthorized: string;
  redirectRecover: string;
  checkingLabel: string;
  connectingLabel: string;
  verifyingLabel: string;
  successLabel: string;
  onSuccess?: (payload: GoogleAuthSuccess) => void;
  footer?: ReactNode;
  consumeRedirectOnMount?: boolean;
  /** Full branded card (default) or a single Google button for checkout embeds. */
  variant?: "card" | "compact";
};

export function GoogleAuthCard({
  title,
  subtitle,
  buttonLabel,
  loginEndpoint,
  locale,
  allowAnyAccount = false,
  loginHint,
  unauthorizedMessage,
  firebaseMissing,
  popupBlocked,
  genericError,
  domainUnauthorized,
  redirectRecover,
  checkingLabel,
  connectingLabel,
  verifyingLabel,
  successLabel,
  onSuccess,
  footer,
  consumeRedirectOnMount = true,
  variant = "card",
}: GoogleAuthCardProps) {
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>(consumeRedirectOnMount ? "checking" : "ready");

  function mapFirebaseCode(code: string): string {
    if (code === "auth/unauthorized-domain") return domainUnauthorized;
    if (code === "auth/popup-blocked") return popupBlocked;
    return genericError;
  }

  async function establishSession(idToken: string): Promise<GoogleAuthSuccess> {
    const res = await fetch(loginEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, locale }),
    });
    const payload = (await res.json().catch(() => null)) as
      | (GoogleAuthSuccess & { error?: string; message?: string })
      | null;
    if (!res.ok) {
      throw new Error(payload?.message || unauthorizedMessage);
    }
    return payload ?? {};
  }

  async function finishWithUser(getIdToken: () => Promise<string>, email?: string | null) {
    if (!allowAnyAccount && email && !isAllowedStaffEmail(email)) {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
      throw new Error(unauthorizedMessage);
    }

    setPhase("verifying");
    const idToken = await getIdToken();
    const payload = await establishSession(idToken);
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setPhase("success");
    onSuccess?.(payload);
  }

  useEffect(() => {
    if (!consumeRedirectOnMount) return;
    let cancelled = false;

    async function consumeRedirect() {
      const auth = getFirebaseAuth();
      if (!auth) {
        if (!cancelled) {
          setError(firebaseMissing);
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
              ? redirectError.message || redirectRecover
              : redirectRecover,
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
      setError(firebaseMissing);
      setPhase("ready");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
      ...(loginHint ? { login_hint: loginHint } : {}),
    });
    provider.addScope("email");
    provider.addScope("profile");

    try {
      const result = await signInWithPopup(auth, provider);
      await finishWithUser(() => result.user.getIdToken(), result.user.email);
    } catch (popupError) {
      const code =
        popupError && typeof popupError === "object" && "code" in popupError
          ? String((popupError as { code: string }).code)
          : "";

      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch {
          setError(popupBlocked);
        }
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError("");
      } else if (popupError instanceof Error) {
        setError(popupError.message.includes("permiso") ? popupError.message : mapFirebaseCode(code));
      } else {
        setError(mapFirebaseCode(code));
      }
      setPhase("ready");
    }
  }

  const busy = phase === "checking" || phase === "connecting" || phase === "verifying" || phase === "success";
  const label =
    phase === "checking"
      ? checkingLabel
      : phase === "connecting"
        ? connectingLabel
        : phase === "verifying" || phase === "success"
          ? verifyingLabel
          : buttonLabel;

  const googleButton = (
    <button
      type="button"
      disabled={busy}
      onClick={handleGoogleSignIn}
      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-hielo/15 bg-white px-5 py-3 text-sm font-semibold text-pizarra shadow-[0_6px_20px_rgba(14,14,15,0.06)] transition hover:border-hielo/30 hover:bg-nieve disabled:cursor-wait disabled:opacity-70"
    >
      <GoogleMark />
      <span>{label}</span>
    </button>
  );

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        {phase === "success" ? (
          <div role="status" className="rounded-xl border border-hielo/15 bg-hielo/5 px-3 py-2 text-center text-sm font-semibold text-hielo">
            {successLabel}
          </div>
        ) : null}
        {error ? (
          <div role="alert" className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm leading-relaxed text-accent">
            {error}
          </div>
        ) : null}
        {googleButton}
        {footer}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-hielo/10 bg-white shadow-[0_24px_60px_rgba(14,14,15,0.12)]">
      <div className="border-b border-hielo/8 bg-gradient-to-r from-frost/40 via-white to-white px-5 py-5 text-center sm:px-6">
        <div className="inline-flex flex-col items-center gap-2.5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Image src={media.logo} alt="" width={48} height={48} className="h-10 w-10 object-contain" priority />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold text-hielo sm:text-xl">{title}</span>
            <span className="mt-0.5 block text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted">
              {subtitle}
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        {phase === "success" ? (
          <div role="status" className="rounded-2xl border border-hielo/15 bg-hielo/5 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-hielo">{successLabel}</p>
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

        {googleButton}

        {footer}
      </div>
    </div>
  );
}
