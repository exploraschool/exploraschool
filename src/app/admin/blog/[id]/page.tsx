import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AffiliateBlogShell } from "@/components/admin/AffiliateBlogShell";
import { AffiliateBlogStudio } from "@/components/admin/AffiliateBlogStudio";
import { requireAffiliateBlogSession } from "@/lib/admin-auth";
import { getAffiliatePost } from "@/lib/affiliate-blog";

type Props = { params: Promise<{ id: string }> };

export default async function AdminBlogEditorPage({ params }: Props) {
  const staff = await requireAffiliateBlogSession();
  const { id } = await params;
  const post = await getAffiliatePost(id);
  if (!post) notFound();

  const title = post.type === "ranking" ? "Ranking de 6" : "Review";
  const inner = <AffiliateBlogStudio initialPost={post} />;

  if (staff.role === "admin") {
    return (
      <AdminShell active="blog" title={title} description="URL + foto → Gemini escribe el borrador.">
        {inner}
      </AdminShell>
    );
  }

  return (
    <AffiliateBlogShell title={title} description="Pega el enlace de Amazon y deja que Gemini escriba.">
      {inner}
    </AffiliateBlogShell>
  );
}
