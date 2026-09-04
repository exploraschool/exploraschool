import { AffiliateBlogShell } from "@/components/admin/AffiliateBlogShell";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AffiliatePostDeleteButton,
  CreateAffiliateButtons,
} from "@/components/admin/AffiliateBlogStudio";
import { requireAffiliateBlogSession } from "@/lib/admin-auth";
import { listAffiliatePosts } from "@/lib/affiliate-blog";
import { isAdminConfigured } from "@/lib/firebase/admin";
import Link from "next/link";

export default async function AdminBlogIndexPage() {
  const staff = await requireAffiliateBlogSession();
  const posts = isAdminConfigured() ? await listAffiliatePosts() : [];
  const inner = (
    <div className="space-y-8">
      {!isAdminConfigured() ? (
        <p className="rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm">
          Firebase Admin no está configurado en este entorno.
        </p>
      ) : null}
      <CreateAffiliateButtons />
      <section>
        <h2 className="font-display text-xl font-semibold">Entradas</h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aún no hay borradores. Empieza con un ranking o una review.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hielo/10 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-pizarra">
                    {post.titleEs || (post.type === "ranking" ? "Ranking sin título" : "Review sin título")}
                  </p>
                  <p className="text-xs text-muted">
                    {post.type === "ranking" ? "Ranking · 6" : "Review"} · {post.status === "published" ? "Publicada" : "Borrador"}
                    {post.slug ? ` · /blog/${post.slug}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/blog/${post.id}`} className="text-sm font-semibold text-hielo hover:underline">
                    Abrir
                  </Link>
                  <AffiliatePostDeleteButton id={post.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  if (staff.role === "admin") {
    return (
      <AdminShell active="blog" title="Blog de afiliados" description="Rankings y reviews de Amazon para Explora.">
        {inner}
      </AdminShell>
    );
  }

  return (
    <AffiliateBlogShell title="Studio de afiliados" description="Pega la URL de Amazon. Captamos la ficha y las fotos; tú revisas y publicas.">
      {inner}
    </AffiliateBlogShell>
  );
}
