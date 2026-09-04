import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GalleryAdminManager } from "@/components/admin/GalleryAdminManager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireAdminPanel } from "@/lib/admin-workspace";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { listLiveGalleryPhotos } from "@/lib/live-gallery";

export default async function AdminGaleriaPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  await requireAdminPanel();

  const photos = isAdminConfigured() ? await listLiveGalleryPhotos() : [];

  return (
    <AdminShell
      active="galeria"
      title="Galería en directo"
      description="Fotos de la sección «La estación, en directo». La home muestra las 12 más recientes; aquí puedes guardar todas las que quieras."
    >
      {!isAdminConfigured() ? (
        <p className="mb-6 rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm text-pizarra">
          Firebase Admin no configurado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
          FIREBASE_PRIVATE_KEY y NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.
        </p>
      ) : (
        <GalleryAdminManager initialPhotos={photos} />
      )}
    </AdminShell>
  );
}
