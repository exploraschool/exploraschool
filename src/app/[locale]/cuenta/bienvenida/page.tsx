import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AccountWelcomeWizard } from "@/components/cuenta/AccountWelcomeWizard";
import { buildPageMetadata } from "@/lib/metadata";
import { getStudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import { isOnboardingComplete } from "@/lib/student-users";

type Props = { params: Promise<{ locale: string }> };

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

export default async function BienvenidaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getStudentSession();
  if (!session) redirect(`/${locale}/cuenta`);

  const profile = await getStudentProfile(session.uid);
  if (profile && isOnboardingComplete(profile) && profile.selfLevel) {
    redirect(`/${locale}/cuenta`);
  }

  return (
    <section className="section-padding">
      <div className="container-page">
        <AccountWelcomeWizard locale={locale} initialProfile={profile} />
      </div>
    </section>
  );
}
