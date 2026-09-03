import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { LIVE_GALLERY_COLLECTION } from "@/lib/live-gallery";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const ref = db.collection(LIVE_GALLERY_COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    const data = snap.data() ?? {};
    const storagePath = String(data.storagePath ?? "");
    if (storagePath) {
      try {
        await bucket.file(storagePath).delete({ ignoreNotFound: true });
      } catch (error) {
        console.error("[admin/gallery] storage delete failed:", error);
      }
    }

    await ref.delete();

    revalidatePath("/");
    revalidatePath("/es");
    revalidatePath("/en");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/gallery] delete failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar la foto" }, { status: 500 });
  }
}
