import Link from "next/link";
import { redirect } from "next/navigation";
import type { Query } from "firebase-admin/firestore";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTrashButton } from "@/components/admin/AdminTrashButton";
import { LeadActions } from "@/components/admin/LeadActions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { isBookingLead, type StoredBookingItem } from "@/lib/leads";
import type { MarketingContact } from "@/lib/marketing-contacts";

type ContactLead = {
  id: string;
  type?: string;
  status?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale?: string;
  source?: string;
  createdAt: string;
  bookingItems?: StoredBookingItem[];
  estimatedTotal?: number;
};

type SearchParams = Promise<{ tab?: string; source?: string; page?: string }>;

const PAGE_SIZE = 20;

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function hrefForEmails(source: string, page: number): string {
  const params = new URLSearchParams();
  params.set("tab", "emails");
  if (source !== "all") params.set("source", source);
  if (page > 1) params.set("page", String(page));
  return `/admin/leads?${params}`;
}

async function countQuery(query: Query): Promise<number> {
  const snap = await query.count().get();
  return snap.data().count;
}

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  await requireAdminPanel();

  const params = await searchParams;
  const tab = params.tab === "emails" ? "emails" : "mensajes";
  const sourceFilter =
    params.source === "booking" || params.source === "contact" ? params.source : "all";
  let page = parsePage(params.page);

  let messages: ContactLead[] = [];
  let emails: MarketingContact[] = [];
  let emailCounts = { all: 0, booking: 0, contact: 0 };
  let totalForFilter = 0;
  let totalPages = 1;

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const [leadsSnap, allCount, bookingCount, contactCount] = await Promise.all([
        db.collection("leads").orderBy("createdAt", "desc").limit(200).get(),
        countQuery(db.collection("marketingContacts")),
        countQuery(db.collection("marketingContacts").where("sources", "array-contains", "booking")),
        countQuery(db.collection("marketingContacts").where("sources", "array-contains", "contact")),
      ]);

      messages = leadsSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ContactLead, "id">),
        }))
        .filter((lead) => !isBookingLead(lead));

      emailCounts = { all: allCount, booking: bookingCount, contact: contactCount };

      if (tab === "emails") {
        const base = db.collection("marketingContacts");
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
          emails = snapshot.docs.map((doc) => doc.data() as MarketingContact);
        } else {
          const skipCount = (page - 1) * PAGE_SIZE;
          const cursorSnap = await listQuery.limit(skipCount).get();
          const cursor = cursorSnap.docs[cursorSnap.docs.length - 1];
          if (cursor) {
            const snapshot = await listQuery.startAfter(cursor).limit(PAGE_SIZE).get();
            emails = snapshot.docs.map((doc) => doc.data() as MarketingContact);
          }
        }
      }
    }
  }

  return (
    <AdminShell
      active="leads"
      title="Contactos"
      description="Mensajes del formulario y emails para campañas, en un solo sitio."
    >
      {!isAdminConfigured() ? (
        <p className="mb-6 rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y
          FIREBASE_PRIVATE_KEY en Vercel.
        </p>
      ) : null}

      <div
        className="mb-4 inline-flex rounded-full border border-hielo/15 bg-white p-0.5 sm:mb-6 sm:p-1"
        role="tablist"
        aria-label="Contactos"
      >
        <Link
          href="/admin/leads"
          role="tab"
          aria-selected={tab === "mensajes"}
          className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
            tab === "mensajes"
              ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
              : "text-pizarra hover:bg-frost/20"
          }`}
        >
          Mensajes
          {messages.length > 0 ? (
            <span className={`ml-1.5 tabular-nums ${tab === "mensajes" ? "text-white/80" : "text-muted"}`}>
              {messages.length}
            </span>
          ) : null}
        </Link>
        <Link
          href="/admin/leads?tab=emails"
          role="tab"
          aria-selected={tab === "emails"}
          className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
            tab === "emails"
              ? "bg-gradient-to-r from-hielo to-hielo-light text-white shadow-[0_4px_14px_rgb(45_107_100_/_0.28)]"
              : "text-pizarra hover:bg-frost/20"
          }`}
        >
          Emails
          {emailCounts.all > 0 ? (
            <span className={`ml-1.5 tabular-nums ${tab === "emails" ? "text-white/80" : "text-muted"}`}>
              {emailCounts.all}
            </span>
          ) : null}
        </Link>
      </div>

      {tab === "mensajes" ? (
        <MessagesPanel messages={messages} />
      ) : (
        <EmailsPanel
          contacts={emails}
          counts={emailCounts}
          sourceFilter={sourceFilter}
          page={page}
          totalPages={totalPages}
          totalForFilter={totalForFilter}
        />
      )}
    </AdminShell>
  );
}

function MessagesPanel({ messages }: { messages: ContactLead[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-14 text-center">
        <p className="font-display text-xl font-semibold text-pizarra">No hay mensajes</p>
        <p className="mt-2 text-sm text-muted">Las consultas del formulario de contacto aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((lead) => (
        <article
          key={lead.id}
          className="rounded-2xl border border-hielo/10 bg-white p-3.5 shadow-[0_8px_32px_rgba(10,18,25,0.04)] sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-hielo/10 px-2.5 py-1 text-xs font-semibold text-hielo">
                  Contacto
                </span>
                <span className="text-xs text-muted">
                  {new Date(lead.createdAt).toLocaleString("es-ES")}
                </span>
              </div>
              <h2 className="mt-2 font-display text-lg font-semibold text-pizarra sm:mt-3 sm:text-xl">{lead.name}</h2>
              <p className="mt-1 text-sm">
                <a href={`mailto:${lead.email}`} className="text-hielo hover:underline">
                  {lead.email}
                </a>
                {lead.phone ? <span className="text-muted"> · {lead.phone}</span> : null}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{lead.message}</p>
              <div className="mt-4">
                <LeadActions leadId={lead.id} status={lead.status ?? "received"} isBooking={false} />
              </div>
            </div>
            <AdminTrashButton
              deleteUrl={`/api/admin/leads/${encodeURIComponent(lead.id)}`}
              label={lead.name || lead.email}
              confirmMessage={`¿Eliminar el contacto de «${lead.name || lead.email}»?`}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function EmailsPanel({
  contacts,
  counts,
  sourceFilter,
  page,
  totalPages,
  totalForFilter,
}: {
  contacts: MarketingContact[];
  counts: { all: number; booking: number; contact: number };
  sourceFilter: "all" | "booking" | "contact";
  page: number;
  totalPages: number;
  totalForFilter: number;
}) {
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-3">
        <div className="rounded-xl border border-hielo/10 bg-white p-3 shadow-[0_2px_16px_rgba(10,18,25,0.04)] sm:rounded-2xl sm:p-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted sm:text-xs">Total únicos</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-pizarra sm:text-3xl">{counts.all}</p>
        </div>
        <div className="rounded-xl border border-hielo/10 bg-white p-3 shadow-[0_2px_16px_rgba(10,18,25,0.04)] sm:rounded-2xl sm:p-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted sm:text-xs">De reservas</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-hielo sm:text-3xl">{counts.booking}</p>
        </div>
        <div className="rounded-xl border border-hielo/10 bg-white p-3 shadow-[0_2px_16px_rgba(10,18,25,0.04)] sm:rounded-2xl sm:p-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted sm:text-xs">De contacto</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-oro sm:text-3xl">{counts.contact}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { id: "all" as const, label: "Todos", href: "/admin/leads?tab=emails" },
          { id: "booking" as const, label: "Solo reservas", href: "/admin/leads?tab=emails&source=booking" },
          { id: "contact" as const, label: "Solo contacto", href: "/admin/leads?tab=emails&source=contact" },
        ].map((filter) => {
          const active = sourceFilter === filter.id;
          return (
            <Link
              key={filter.id}
              href={filter.href}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-pizarra text-nieve"
                  : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
              }`}
            >
              {filter.label}
            </Link>
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
                        {contact.lastSeenAt ? new Date(contact.lastSeenAt).toLocaleString("es-ES") : "—"}
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
            hrefForPage={(nextPage) => hrefForEmails(sourceFilter, nextPage)}
            itemLabel={{ singular: "email", plural: "emails" }}
          />
        </>
      )}
    </>
  );
}
