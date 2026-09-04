import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTrashButton } from "@/components/admin/AdminTrashButton";
import { LeadActions } from "@/components/admin/LeadActions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { isBookingLead, type StoredBookingItem } from "@/lib/leads";

type Lead = {
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

export default async function AdminLeadsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  await requireAdminPanel();

  let contacts: Lead[] = [];

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const snapshot = await db.collection("leads").orderBy("createdAt", "desc").limit(200).get();
      contacts = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Lead, "id">),
        }))
        .filter((lead) => !isBookingLead(lead));
    }
  }

  return (
    <AdminShell
      active="leads"
      title="Contactos"
      description="Mensajes del formulario de contacto (no son reservas)."
    >
      {!isAdminConfigured() && (
        <p className="mb-6 rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y
          FIREBASE_PRIVATE_KEY en Vercel.
        </p>
      )}

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-pizarra">No hay contactos</p>
          <p className="mt-2 text-sm text-muted">Las consultas del formulario de contacto aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((lead) => (
            <article
              key={lead.id}
              className="rounded-2xl border border-hielo/10 bg-white p-5 shadow-[0_8px_32px_rgba(10,18,25,0.04)]"
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
                  <h2 className="mt-3 font-display text-xl font-semibold text-pizarra">{lead.name}</h2>
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
      )}
    </AdminShell>
  );
}
