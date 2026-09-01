import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale?: string;
  createdAt: string;
};

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
          <h1 className="font-display text-3xl font-semibold text-hielo">Leads</h1>
          <p className="text-sm text-muted">Explora School & Club</p>
        </div>
        <AdminLogoutButton />
      </div>

      {!isAdminConfigured() && (
        <p className="mb-6 rounded-lg border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y
          FIREBASE_PRIVATE_KEY para ver leads en Firestore.
        </p>
      )}

      {leads.length === 0 ? (
        <p className="text-muted">No hay leads todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hielo/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-hielo/10 bg-nieve text-left">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Teléfono</th>
                <th className="px-4 py-3 font-semibold">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-hielo/10 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {new Date(lead.createdAt).toLocaleString("es-ES")}
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${lead.email}`} className="text-hielo hover:underline">
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{lead.phone || "—"}</td>
                  <td className="px-4 py-3 max-w-xs text-muted">{lead.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
