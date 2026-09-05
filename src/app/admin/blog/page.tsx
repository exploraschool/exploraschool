import { AffiliateBlogShell } from "@/components/admin/AffiliateBlogShell";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AffiliatePostDeleteButton,
  CreateAffiliateButtons,
} from "@/components/admin/AffiliateBlogStudio";
import { requireAffiliateBlogSession } from "@/lib/admin-auth";
import { listAffiliatePosts } from "@/lib/affiliate-blog";
import { isAdminConfigured } from "@/lib/firebase/admin";
import Link from "next/link";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ page?: string }>;

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function hrefForBlogPage(page: number): string {
  return page > 1 ? `/admin/blog?page=${page}` : "/admin/blog";
}

export default async function AdminBlogIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const staff = await requireAffiliateBlogSession();
  const params = await searchParams;
  const posts = isAdminConfigured() ? await listAffiliatePosts() : [];
  const totalItems = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(parsePage(params.page), totalPages);
  const pagePosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        {totalItems === 0 ? (
          <p className="mt-3 text-sm text-muted">Aún no hay borradores. Empieza con un ranking o una review.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {pagePosts.map((post) => (
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
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              hrefForPage={hrefForBlogPage}
              itemLabel={{ singular: "entrada", plural: "entradas" }}
            />
          </>
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
