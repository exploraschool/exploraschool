import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { StudentGoogleAuthCard } from "@/components/cuenta/StudentGoogleAuthCard";
import { AccountDashboard } from "@/components/cuenta/AccountDashboard";
import { buildPageMetadata } from "@/lib/metadata";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { isOnboardingComplete } from "@/lib/student-users";
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

  if (await isAdminAuthenticated()) {
    redirect("/admin/hoy");
  }

  const session = await getStudentSession();

  if (!session) {
    return (
      <section className="section-padding">
        <div className="container-page mx-auto max-w-md">
          <StudentGoogleAuthCard locale={locale} />
        </div>
      </section>
    );
  }

  const profile = await getStudentProfile(session.uid);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect(`/${locale}/cuenta/bienvenida`);
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
      hours={dashboard.hours}
      badges={dashboard.badges}
      meetingPoint={dashboard.meetingPoint}
      newLessonUrl={dashboard.newLessonUrl}
      lastInstructorName={dashboard.lastInstructorName}
    />
  );
}
