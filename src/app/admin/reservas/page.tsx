import { redirect } from "next/navigation";
import type { Query } from "firebase-admin/firestore";
import { AdminBookingCard, type AdminBookingLead } from "@/components/admin/AdminBookingCard";
import { AdminBookingFilters } from "@/components/admin/AdminBookingFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { listActiveInstructorsFromDb } from "@/lib/instructors-db";

type SearchParams = Promise<{ status?: string; page?: string }>;

const ALLOWED_STATUS = new Set(["pending", "confirmed", "cancelled"]);
const PAGE_SIZE = 10;

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function hrefForReservasPage(status: string, page: number): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/reservas?${qs}` : "/admin/reservas";
}

async function countQuery(query: Query): Promise<number> {
  const snap = await query.count().get();
  return snap.data().count;
}

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const instructors = (await listActiveInstructorsFromDb()).map((item) => ({
    slug: item.slug,
    name: item.name,
  }));

  const params = await searchParams;
  const statusFilter =
    params.status && ALLOWED_STATUS.has(params.status) ? params.status : "all";
  let page = parsePage(params.page);

  let bookings: AdminBookingLead[] = [];
  let counts = { all: 0, pending: 0, confirmed: 0, cancelled: 0 };
  let totalForFilter = 0;
  let totalPages = 1;

  if (isAdminConfigured()) {
    const db = getAdminDb();
    if (db) {
      const bookingsBase = db.collection("leads").where("type", "==", "booking");

      const [allCount, pendingCount, confirmedCount, cancelledCount] = await Promise.all([
        countQuery(bookingsBase),
        countQuery(bookingsBase.where("status", "==", "pending")),
        countQuery(bookingsBase.where("status", "==", "confirmed")),
        countQuery(bookingsBase.where("status", "==", "cancelled")),
      ]);

      counts = {
        all: allCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
      };

      totalForFilter =
        statusFilter === "all"
          ? allCount
          : statusFilter === "pending"
            ? pendingCount
            : statusFilter === "confirmed"
              ? confirmedCount
              : cancelledCount;

      totalPages = Math.max(1, Math.ceil(totalForFilter / PAGE_SIZE));
      if (page > totalPages) page = totalPages;

      let listQuery: Query = bookingsBase.orderBy("createdAt", "desc");
      if (statusFilter !== "all") {
        listQuery = bookingsBase.where("status", "==", statusFilter).orderBy("createdAt", "desc");
      }

      if (page === 1) {
        const snapshot = await listQuery.limit(PAGE_SIZE).get();
        bookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AdminBookingLead, "id">),
        }));
      } else {
        const skipCount = (page - 1) * PAGE_SIZE;
        const cursorSnap = await listQuery.limit(skipCount).get();
        const cursor = cursorSnap.docs[cursorSnap.docs.length - 1];
        if (cursor) {
          const snapshot = await listQuery.startAfter(cursor).limit(PAGE_SIZE).get();
          bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<AdminBookingLead, "id">),
          }));
        }
      }
    }
  }

  return (
    <AdminShell
      active="reservas"
      title="Reservas"
      description="Consulta, confirma o rechaza las solicitudes. Desde el email del equipo también puedes confirmar o rechazar con un clic; el cliente recibe el aviso automáticamente."
    >
      {!isAdminConfigured() && (
        <p className="mb-6 rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y
          FIREBASE_PRIVATE_KEY en Vercel.
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pendientes</p>
          <p className="mt-1 font-display text-3xl font-semibold text-oro">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Confirmadas</p>
          <p className="mt-1 font-display text-3xl font-semibold text-hielo">{counts.confirmed}</p>
        </div>
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_2px_16px_rgba(10,18,25,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Rechazadas</p>
          <p className="mt-1 font-display text-3xl font-semibold text-accent">{counts.cancelled}</p>
        </div>
      </div>

      <div className="mb-5">
        <AdminBookingFilters active={statusFilter} counts={counts} />
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-pizarra">No hay reservas aquí</p>
          <p className="mt-2 text-sm text-muted">
            {statusFilter === "all"
              ? "Cuando lleguen solicitudes desde /reserva aparecerán en este panel."
              : "Prueba otro filtro o espera nuevas solicitudes."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((lead) => (
              <AdminBookingCard key={lead.id} lead={lead} instructors={instructors} />
            ))}
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalForFilter}
            pageSize={PAGE_SIZE}
            hrefForPage={(nextPage) => hrefForReservasPage(statusFilter, nextPage)}
          />
        </>
      )}
    </AdminShell>
  );
}
