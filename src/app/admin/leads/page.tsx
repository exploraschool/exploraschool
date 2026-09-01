import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { isBookingLead, type StoredBookingItem } from "@/lib/leads";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { LeadActions } from "@/components/admin/LeadActions";

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

function statusLabel(status?: string): string {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Cancelada";
    case "received":
      return "Recibido";
    default:
      return status ?? "—";
  }
}

export default async function AdminLeadsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  let leads: Lead[] = [];

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const snapshot = await db
        .collection("leads")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
      leads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Lead, "id">),
      }));
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-hielo">Leads y reservas</h1>
          <p className="text-sm text-muted">Confirma reservas para enviar email automático al cliente</p>
        </div>
        <AdminLogoutButton />
      </div>

      {!isAdminConfigured() && (
        <p className="mb-6 rounded-lg border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y
          FIREBASE_PRIVATE_KEY en Vercel.
        </p>
      )}

      {leads.length === 0 ? (
        <p className="text-muted">No hay leads todavía.</p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const booking = isBookingLead(lead);
            return (
              <article
                key={lead.id}
                className="rounded-2xl border border-hielo/10 bg-white p-5 shadow-[0_8px_32px_rgba(10,18,25,0.04)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-hielo/10 px-2.5 py-1 text-xs font-semibold text-hielo">
                        {booking ? "Reserva" : "Contacto"}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(lead.createdAt).toLocaleString("es-ES")}
                      </span>
                      <span className="text-xs font-medium text-muted">{statusLabel(lead.status)}</span>
                    </div>

                    <h2 className="mt-3 font-display text-xl font-semibold text-pizarra">{lead.name}</h2>
                    <p className="mt-1 text-sm">
                      <a href={`mailto:${lead.email}`} className="text-hielo hover:underline">
                        {lead.email}
                      </a>
                      {lead.phone ? <span className="text-muted"> · {lead.phone}</span> : null}
                    </p>

                    {lead.bookingItems && lead.bookingItems.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-muted">
                        {lead.bookingItems.map((item, index) => (
                          <li key={`${item.productId}-${item.date}-${index}`} className="rounded-xl bg-nieve px-3 py-2">
                            <span className="font-medium text-pizarra">{item.productId}</span>
                            {" · "}
                            {item.date} · {item.timeSlotLabel} · {item.participants} pers. · {item.lineTotal} €
                            {item.instructorName ? ` · ${item.instructorName}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}

                    {lead.estimatedTotal !== undefined && (
                      <p className="mt-3 text-sm font-semibold text-hielo">Total estimado: {lead.estimatedTotal} €</p>
                    )}

                    <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{lead.message}</p>
                  </div>

                  <div className="shrink-0">
                    <LeadActions
                      leadId={lead.id}
                      status={lead.status ?? (booking ? "pending" : "received")}
                      isBooking={booking}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
