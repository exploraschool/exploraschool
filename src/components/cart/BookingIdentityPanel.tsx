"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";
import { Link } from "@/i18n/routing";

export type BookingStudentUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone: string;
  onboardingComplete: boolean;
};

type BookingIdentityPanelProps = {
  locale: string;
  user: BookingStudentUser | null;
  authReady: boolean;
  onSignedIn: (user: BookingStudentUser) => void;
};

export function BookingIdentityPanel({
  locale,
  user,
  authReady,
  onSignedIn,
}: BookingIdentityPanelProps) {
  const t = useTranslations("cart");
  const ta = useTranslations("account");
  const router = useRouter();

  if (!authReady) {
    return (
      <div className="rounded-2xl border border-hielo/10 bg-nieve/70 px-4 py-3 text-sm text-muted">
        {ta("checking")}
      </div>
    );
  }

  if (user) {
    const label = user.displayName || user.email;
    return (
      <div className="rounded-2xl border border-hielo/15 bg-gradient-to-br from-hielo/[0.06] via-white to-nieve px-4 py-3.5">
        <div className="flex items-start gap-3">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hielo/10 text-sm font-bold text-hielo">
              {label.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-hielo/70">
              {t("signedInBadge")}
            </p>
            <p className="truncate font-display text-base font-semibold text-hielo">{label}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t("signedInHint")}</p>
            <Link
              href="/cuenta"
              className="mt-2 inline-flex text-xs font-semibold text-hielo underline-offset-2 hover:text-accent hover:underline"
            >
              {t("openAccount")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-hielo/15 bg-white">
      <div className="border-b border-hielo/10 bg-gradient-to-r from-hielo/8 via-white to-nieve px-4 py-3.5">
        <p className="font-display text-base font-semibold text-hielo">{t("formalizeTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{t("formalizeDesc")}</p>
      </div>
      <div className="space-y-3 px-4 py-4">
        <GoogleAuthCard
          variant="compact"
          title={t("formalizeTitle")}
          subtitle="Explora School & Club"
          buttonLabel={t("googleFormalize")}
          loginEndpoint="/api/cuenta/login"
          locale={locale}
          allowAnyAccount
          unauthorizedMessage={ta("errors.generic")}
          firebaseMissing={ta("errors.firebaseMissing")}
          popupBlocked={ta("errors.popupBlocked")}
          genericError={ta("errors.generic")}
          domainUnauthorized={ta("errors.domainUnauthorized")}
          redirectRecover={ta("errors.redirectRecover")}
          checkingLabel={ta("checking")}
          connectingLabel={ta("connecting")}
          verifyingLabel={ta("verifying")}
          successLabel={t("googleFormalizeSuccess")}
          onSuccess={async (payload) => {
            if (payload.role === "staff") {
              router.push("/admin/reservas");
              router.refresh();
              return;
            }

            try {
              await fetch("/api/cuenta/link-bookings", { method: "POST" }).catch(() => null);
              const res = await fetch("/api/cuenta/me");
              const data = (await res.json().catch(() => null)) as
                | { user?: BookingStudentUser | null }
                | null;
              if (data?.user) {
                onSignedIn(data.user);
                return;
              }
            } catch {
              /* fall through */
            }

            if (payload.email) {
              onSignedIn({
                uid: "",
                email: payload.email,
                displayName: "",
                photoURL: "",
                phone: "",
                onboardingComplete: Boolean(payload.onboardingComplete),
              });
            }
          }}
        />
        <div className="relative py-1 text-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-hielo/10" aria-hidden />
          <span className="relative bg-white px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("orContinueManual")}
          </span>
        </div>
        <p className="text-center text-xs text-muted">{t("manualFormHint")}</p>
      </div>
    </div>
  );
}
