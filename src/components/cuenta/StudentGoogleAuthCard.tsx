"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";
import { localizedPath } from "@/lib/seo-urls";

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
      errorMessages={{ no_confirmed_booking: t("errors.noConfirmedBooking") }}
      footer={<p className="text-center text-xs leading-relaxed text-muted">{t("loginLead")}</p>}
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
          router.push(payload.homePath || "/admin/reservas");
          router.refresh();
          return;
        }
        router.push(
          payload.onboardingComplete
            ? localizedPath(locale, "/cuenta")
            : localizedPath(locale, "/cuenta/bienvenida"),
        );
        router.refresh();
      }}
    />
  );
}
