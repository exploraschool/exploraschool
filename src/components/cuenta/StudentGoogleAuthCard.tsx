"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";

type StudentGoogleAuthCardProps = {
  locale: string;
};

export function StudentGoogleAuthCard({ locale }: StudentGoogleAuthCardProps) {
  const router = useRouter();
  const t = useTranslations("account");

  return (
    <GoogleAuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      buttonLabel={t("googleButton")}
      loginEndpoint="/api/cuenta/login"
      locale={locale}
      allowAnyAccount
      unauthorizedMessage={t("errors.generic")}
      firebaseMissing={t("errors.firebaseMissing")}
      popupBlocked={t("errors.popupBlocked")}
      genericError={t("errors.generic")}
      domainUnauthorized={t("errors.domainUnauthorized")}
      redirectRecover={t("errors.redirectRecover")}
      checkingLabel={t("checking")}
      connectingLabel={t("connecting")}
      verifyingLabel={t("verifying")}
      successLabel={t("welcome")}
      onSuccess={(payload) => {
        if (payload.role === "staff") {
          router.push("/admin/hoy");
          router.refresh();
          return;
        }
        router.push(payload.onboardingComplete ? `/${locale}/cuenta` : `/${locale}/cuenta/bienvenida`);
        router.refresh();
      }}
    />
  );
}
