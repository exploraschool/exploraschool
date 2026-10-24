import type { Metadata } from "next";
import { DocumentShell } from "@/components/DocumentShell";
import { PublicNotFound } from "@/components/PublicNotFound";
import { notFoundPageMetadata } from "@/components/NotFoundView";
import { routing } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  return notFoundPageMetadata(routing.defaultLocale);
}

export default async function NotFound() {
  return (
    <DocumentShell lang={routing.defaultLocale}>
      <PublicNotFound locale={routing.defaultLocale} />
    </DocumentShell>
  );
}
