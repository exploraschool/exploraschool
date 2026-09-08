import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { getDisciplineBySlug, type MainDisciplineId } from "@/data/disciplines";
import { disciplinePath } from "@/lib/seo-urls";

const IDS: MainDisciplineId[] = ["esqui", "snowboard", "telemark", "esqui-adaptado", "ninos"];

type Props = { params: Promise<{ locale: string; discipline: string }> };

export default async function LegacyDisciplineRedirect({ params }: Props) {
  const { locale, discipline } = await params;
  const d = getDisciplineBySlug(discipline);
  if (!d || !IDS.includes(d.id)) notFound();
  redirect({ href: disciplinePath(d.id), locale: locale === "en" ? "en" : "es" });
}
