import type { Metadata } from "next";
import { DisciplineLessonPage, disciplineMetadata } from "../DisciplineLessonPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return disciplineMetadata(locale, "esqui-adaptado");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <DisciplineLessonPage locale={locale} id="esqui-adaptado" />;
}
