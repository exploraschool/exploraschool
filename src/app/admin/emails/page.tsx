import { redirect } from "next/navigation";

type SearchParams = Promise<{ source?: string; page?: string }>;

export default async function AdminEmailsRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  qs.set("tab", "emails");
  if (params.source) qs.set("source", params.source);
  if (params.page) qs.set("page", params.page);
  redirect(`/admin/leads?${qs}`);
}
