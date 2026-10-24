import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { PublicNotFound } from "@/components/PublicNotFound";
import { notFoundPageMetadata } from "@/components/NotFoundView";
import { routing } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  return notFoundPageMetadata(routing.defaultLocale);
}

export default async function LocaleNotFound() {
  const locale = await getLocale();
  return <PublicNotFound locale={locale} />;
}
