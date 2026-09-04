"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";
import { adminCopy } from "@/lib/admin-copy";
import { staffHomePath } from "@/lib/admin-auth-config";

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

  return (
    <GoogleAuthCard
      title={adminCopy.brand}
      subtitle={adminCopy.panelName}
      buttonLabel={adminCopy.googleButton}
      loginEndpoint="/api/admin/login"
      unauthorizedMessage={adminCopy.errors.unauthorizedEmail}
      firebaseMissing={adminCopy.errors.firebaseMissing}
      popupBlocked={adminCopy.errors.popupBlocked}
      genericError={adminCopy.errors.generic}
      domainUnauthorized={adminCopy.errors.domainUnauthorized}
      redirectRecover={adminCopy.errors.redirectRecover}
      checkingLabel={adminCopy.checkingSession}
      connectingLabel={adminCopy.googleButtonLoading}
      verifyingLabel={adminCopy.googleButtonVerifying}
      successLabel={adminCopy.welcomeBack}
      consumeRedirectOnMount={consumeRedirectOnMount}
      footer={footer}
      onSuccess={(payload) => {
        onSuccess?.();
        const next =
          payload.homePath ||
          (payload.staffRole ? staffHomePath(payload.staffRole) : "/admin/reservas");
        router.push(next);
        router.refresh();
      }}
    />
  );
}
