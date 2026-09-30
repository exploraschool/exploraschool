import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { redirect as intlRedirect } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { StudentGoogleAuthCard } from "@/components/cuenta/StudentGoogleAuthCard";
import { AccountDashboard } from "@/components/cuenta/AccountDashboard";
import { buildPageMetadata } from "@/lib/metadata";
import { getStaffSession, staffHomePath } from "@/lib/admin-auth";
import { getStudentIdentity, getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { canAccessStudentDashboard } from "@/lib/student-users";
import { loadStudentDashboard } from "@/lib/student-dashboard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildPageMetadata({
    locale,
    path: "/cuenta",
    title: t("metaTitle"),
    description: t("metaDescription"),
    noIndex: true,
  });
}

export default async function CuentaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const staff = await getStaffSession();
  if (staff) {
    redirect(staffHomePath(staff.role));
  }

  const session = await getStudentSession();

  if (!session) {
    const identity = await getStudentIdentity();
    const t = await getTranslations({ locale, namespace: "account" });
    return (
      <section className="section-padding">
        <div className="container-page mx-auto max-w-md">
          {identity ? (
            <div className="rounded-3xl border border-hielo/10 bg-white px-5 py-6 text-sm leading-relaxed text-pizarra shadow-[0_24px_60px_rgba(14,14,15,0.08)]">
              <p className="font-display text-lg font-semibold text-hielo">{identity.name || identity.email}</p>
              <p className="mt-3">{t("errors.noConfirmedBooking")}</p>
            </div>
          ) : (
            <StudentGoogleAuthCard locale={locale} />
          )}
        </div>
      </section>
    );
  }

  const profile = await getStudentProfile(session.uid);
  if (!profile || !canAccessStudentDashboard(profile)) {
    return intlRedirect({ href: "/cuenta/bienvenida", locale: locale === "en" ? "en" : "es" });
  }

  const dashboard = await loadStudentDashboard(session);
  return (
    <AccountDashboard
      locale={locale}
      name={dashboard.name}
      profile={dashboard.profile}
      requested={dashboard.requested}
      confirmed={dashboard.confirmed}
      history={dashboard.history}
      reports={dashboard.reports}
      tips={dashboard.tips}
      hours={dashboard.hours}
      badges={dashboard.badges}
      meetingPoint={dashboard.meetingPoint}
      newLessonUrl={dashboard.newLessonUrl}
      lastInstructorName={dashboard.lastInstructorName}
    />
  );
}
