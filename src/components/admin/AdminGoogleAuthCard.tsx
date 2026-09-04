"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";
import { ADMIN_GOOGLE_EMAIL } from "@/lib/admin-auth-config";
import { adminCopy } from "@/lib/admin-copy";

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
      loginHint={ADMIN_GOOGLE_EMAIL}
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
      onSuccess={() => {
        onSuccess?.();
        router.push("/admin/reservas");
        router.refresh();
      }}
    />
  );
}
