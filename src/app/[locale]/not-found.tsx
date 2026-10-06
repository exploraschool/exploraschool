import type { Metadata } from "next";
import { NotFoundView, notFoundPageMetadata } from "@/components/NotFoundView";

export async function generateMetadata(): Promise<Metadata> {
  return notFoundPageMetadata();
}

export default function LocaleNotFound() {
  return <NotFoundView />;
}
