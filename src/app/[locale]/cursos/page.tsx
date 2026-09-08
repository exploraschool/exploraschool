import { redirect } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function CursosRedirect({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/clases", locale: locale === "en" ? "en" : "es" });
}
