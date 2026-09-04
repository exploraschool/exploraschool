import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AccountWelcomeWizard } from "@/components/cuenta/AccountWelcomeWizard";
import { buildPageMetadata } from "@/lib/metadata";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { canAccessStudentDashboard } from "@/lib/student-users";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ edit?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildPageMetadata({
    locale,
    path: "/cuenta/bienvenida",
    title: t("welcomeMetaTitle"),
    description: t("metaDescription"),
    noIndex: true,
  });
}

export default async function BienvenidaPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);

  if (await isAdminAuthenticated()) {
    redirect("/admin/reservas");
  }

  const session = await getStudentSession();
  if (!session) redirect(`/${locale}/cuenta`);

  const profile = await getStudentProfile(session.uid);
  const editing = edit === "1";

  if (profile && canAccessStudentDashboard(profile) && !editing) {
    redirect(`/${locale}/cuenta`);
  }

  return (
    <section className="section-padding !py-6 sm:!py-10">
      <div className="container-page">
        <AccountWelcomeWizard locale={locale} initialProfile={profile} editMode={editing} />
      </div>
    </section>
  );
}
