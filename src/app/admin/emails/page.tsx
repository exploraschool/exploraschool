import { redirect } from "next/navigation";
import type { Query } from "firebase-admin/firestore";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTrashButton } from "@/components/admin/AdminTrashButton";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { MarketingContact } from "@/lib/marketing-contacts";

type SearchParams = Promise<{ source?: string; page?: string }>;

const PAGE_SIZE = 20;

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function hrefForEmailsPage(source: string, page: number): string {
  const params = new URLSearchParams();
  if (source !== "all") params.set("source", source);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/emails?${qs}` : "/admin/emails";
}

async function countQuery(query: Query): Promise<number> {
  const snap = await query.count().get();
  return snap.data().count;
}

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  await requireAdminPanel();

  const params = await searchParams;
  const sourceFilter =
    params.source === "booking" || params.source === "contact" ? params.source : "all";
  let page = parsePage(params.page);

  let contacts: MarketingContact[] = [];
  let counts = { all: 0, booking: 0, contact: 0 };
  let totalForFilter = 0;
  let totalPages = 1;

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const base = db.collection("marketingContacts");

      const [allCount, bookingCount, contactCount] = await Promise.all([
        countQuery(base),
        countQuery(base.where("sources", "array-contains", "booking")),
        countQuery(base.where("sources", "array-contains", "contact")),
      ]);

      counts = { all: allCount, booking: bookingCount, contact: contactCount };
      totalForFilter =
        sourceFilter === "booking"
          ? bookingCount
          : sourceFilter === "contact"
            ? contactCount
            : allCount;

      totalPages = Math.max(1, Math.ceil(totalForFilter / PAGE_SIZE));
      if (page > totalPages) page = totalPages;

      let listQuery: Query = base.orderBy("lastSeenAt", "desc");
      if (sourceFilter === "booking") {
        listQuery = base.where("sources", "array-contains", "booking").orderBy("lastSeenAt", "desc");
      } else if (sourceFilter === "contact") {
        listQuery = base.where("sources", "array-contains", "contact").orderBy("lastSeenAt", "desc");
      }

      if (page === 1) {
        const snapshot = await listQuery.limit(PAGE_SIZE).get();
        contacts = snapshot.docs.map((doc) => doc.data() as MarketingContact);
      } else {
        const skipCount = (page - 1) * PAGE_SIZE;
        const cursorSnap = await listQuery.limit(skipCount).get();
        const cursor = cursorSnap.docs[cursorSnap.docs.length - 1];
        if (cursor) {
          const snapshot = await listQuery.startAfter(cursor).limit(PAGE_SIZE).get();
          contacts = snapshot.docs.map((doc) => doc.data() as MarketingContact);
        }
      }
    }
  }

  return (
    <AdminShell
      active="emails"
      title="Emails marketing"
      description="Registro automático de emails de reservas y contactos para futuras campañas."
    >
      {!isAdminConfigured() && (
        <p className="mb-6 rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. No se pueden listar emails.
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total únicos</p>
          <p className="mt-1 font-display text-3xl font-semibold text-pizarra">{counts.all}</p>
        </div>
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">De reservas</p>
          <p className="mt-1 font-display text-3xl font-semibold text-hielo">{counts.booking}</p>
        </div>
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">De contacto</p>
          <p className="mt-1 font-display text-3xl font-semibold text-oro">{counts.contact}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { id: "all", label: "Todos", href: "/admin/emails" },
          { id: "booking", label: "Solo reservas", href: "/admin/emails?source=booking" },
          { id: "contact", label: "Solo contacto", href: "/admin/emails?source=contact" },
        ].map((filter) => {
          const active = sourceFilter === filter.id;
          return (
            <a
              key={filter.id}
              href={filter.href}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-pizarra text-nieve"
                  : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
              }`}
            >
              {filter.label}
            </a>
          );
        })}
      </div>

      {totalForFilter === 0 ? (
        <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-pizarra">Aún no hay emails registrados</p>
          <p className="mt-2 text-sm text-muted">
            Se añaden solos cuando llega una reserva o un mensaje de contacto.
          </p>
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-muted">No hay emails en este filtro.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-hielo/10 bg-nieve/80 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold">Reservas</th>
                    <th className="px-4 py-3 font-semibold">Última vez</th>
                    <th className="px-4 py-3 font-semibold">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hielo/8">
                  {contacts.map((contact) => (
                    <tr key={contact.email} className="hover:bg-frost/10">
                      <td className="px-4 py-3">
                        <a href={`mailto:${contact.email}`} className="font-medium text-hielo hover:underline">
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-pizarra">{contact.name || "—"}</td>
                      <td className="px-4 py-3 text-muted">{contact.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(contact.sources ?? []).map((source) => (
                            <span
                              key={source}
                              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                                source === "booking"
                                  ? "bg-hielo/10 text-hielo"
                                  : "bg-oro/15 text-pizarra"
                              }`}
                            >
                              {source === "booking" ? "Reserva" : "Contacto"}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-pizarra">{contact.bookingCount ?? 0}</td>
                      <td className="px-4 py-3 text-muted">
                        {contact.lastSeenAt
                          ? new Date(contact.lastSeenAt).toLocaleString("es-ES")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AdminTrashButton
                          deleteUrl={`/api/admin/marketing/contacts/${encodeURIComponent(contact.email)}`}
                          label={contact.email}
                          confirmMessage={`¿Eliminar el email «${contact.email}» del registro de marketing?`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-hielo/8 px-4 py-3 text-xs text-muted">
              Usa estos emails solo conforme a tu política de privacidad.
            </p>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalForFilter}
            pageSize={PAGE_SIZE}
            hrefForPage={(nextPage) => hrefForEmailsPage(sourceFilter, nextPage)}
            itemLabel={{ singular: "email", plural: "emails" }}
          />
        </>
      )}
    </AdminShell>
  );
}
