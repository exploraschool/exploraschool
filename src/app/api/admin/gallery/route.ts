import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminBucket, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  LIVE_GALLERY_COLLECTION,
  LIVE_GALLERY_MAX_PHOTOS,
  LIVE_GALLERY_MAX_UPLOAD_BATCH,
  LIVE_GALLERY_STORAGE_PREFIX,
  listLiveGalleryPhotos,
  publicStorageUrl,
  type LiveGalleryPhoto,
} from "@/lib/live-gallery";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 6 * 1024 * 1024;

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function revalidateGalleryPages() {
  revalidatePath("/");
  revalidatePath("/es");
  revalidatePath("/en");
}

function collectFiles(form: FormData): File[] {
  const fromFiles = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (fromFiles.length > 0) return fromFiles;
  const single = form.get("file");
  return single instanceof File ? [single] : [];
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured", photos: [] }, { status: 503 });
  }

  try {
    const photos = await listLiveGalleryPhotos();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("[admin/gallery] list failed:", error);
    return NextResponse.json({ error: "Failed to list photos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const db = getAdminDb();
  const bucket = getAdminBucket();
  if (!db || !bucket) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const existing = await listLiveGalleryPhotos();
    const slotsLeft = LIVE_GALLERY_MAX_PHOTOS - existing.length;
    if (slotsLeft <= 0) {
      return NextResponse.json(
        { error: `Máximo ${LIVE_GALLERY_MAX_PHOTOS} fotos en la galería` },
        { status: 400 },
      );
    }

    const form = await request.formData();
    const files = collectFiles(form);
    if (files.length === 0) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }

    if (files.length > LIVE_GALLERY_MAX_UPLOAD_BATCH) {
      return NextResponse.json(
        { error: `Máximo ${LIVE_GALLERY_MAX_UPLOAD_BATCH} fotos por subida` },
        { status: 400 },
      );
    }

    if (files.length > slotsLeft) {
      return NextResponse.json(
        {
          error: `Solo caben ${slotsLeft} foto${slotsLeft === 1 ? "" : "s"} más (máximo ${LIVE_GALLERY_MAX_PHOTOS})`,
        },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ error: `Usa JPG, PNG o WebP (${file.name})` }, { status: 400 });
      }
      if (file.size <= 0 || file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `Cada imagen debe pesar menos de 6 MB (${file.name})` },
          { status: 400 },
        );
      }
    }

    const altEs = String(form.get("altEs") ?? "").trim() || "Sierra Nevada en directo";
    const altEn = String(form.get("altEn") ?? "").trim() || "Sierra Nevada live";
    let nextOrder =
      existing.length > 0 ? Math.max(...existing.map((photo) => photo.order)) + 1 : 0;

    const uploaded: LiveGalleryPhoto[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const storagePath = `${LIVE_GALLERY_STORAGE_PREFIX}/${id}.${extensionFor(file.type)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const object = bucket.file(storagePath);

      await object.save(buffer, {
        resumable: false,
        metadata: {
          contentType: file.type,
          cacheControl: "public, max-age=31536000",
          metadata: {
            firebaseStorageDownloadTokens: id,
          },
        },
      });

      try {
        await object.makePublic();
      } catch {
        /* token URL still works if makePublic is blocked by org policy */
      }

      const src = publicStorageUrl(bucket.name, storagePath, id);
      const createdAt = new Date().toISOString();
      const photo: LiveGalleryPhoto = {
        id,
        src,
        storagePath,
        altEs,
        altEn,
        order: nextOrder,
        createdAt,
      };

      await db.collection(LIVE_GALLERY_COLLECTION).doc(id).set(photo);
      uploaded.push(photo);
      nextOrder += 1;
    }

    revalidateGalleryPages();

    return NextResponse.json({
      photos: uploaded,
      photo: uploaded[0],
    });
  } catch (error) {
    console.error("[admin/gallery] upload failed:", error);
    return NextResponse.json({ error: "No se pudo subir la foto" }, { status: 500 });
  }
}
