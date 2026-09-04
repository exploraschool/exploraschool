import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/admin-auth";
import {
  AFFILIATE_BLOG_MAX_IMAGE_BYTES,
  completeAffiliateImageUpload,
  getAffiliatePost,
  prepareAffiliateImageUpload,
} from "@/lib/affiliate-blog";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

const prepareSchema = z.object({
  fileName: z.string().min(1).max(180),
  contentType: z.string().max(80).optional().default(""),
  size: z.number().int().positive().max(AFFILIATE_BLOG_MAX_IMAGE_BYTES),
  productIndex: z.number().int().min(0).max(5),
});

export async function PUT(request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { id } = await params;
  const post = await getAffiliatePost(id);
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const parsed = prepareSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  try {
    const prepared = await prepareAffiliateImageUpload({
      postId: id,
      fileName: parsed.data.fileName,
      contentType: parsed.data.contentType,
      size: parsed.data.size,
    });
    return NextResponse.json({ ...prepared, productIndex: parsed.data.productIndex });
  } catch (error) {
    const code = error instanceof Error ? error.message : "upload_failed";
    return NextResponse.json({ error: code }, { status: code === "file_too_large" ? 400 : 500 });
  }
}

const completeSchema = z.object({
  storagePath: z.string().min(1).max(300),
  contentType: z.string().min(3).max(80),
  productIndex: z.number().int().min(0).max(5),
});

export async function POST(request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const header = request.headers.get("content-type") || "";

  if (header.includes("application/json")) {
    const parsed = completeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "invalid_data" }, { status: 400 });
    try {
      const post = await completeAffiliateImageUpload({
        postId: id,
        productIndex: parsed.data.productIndex,
        storagePath: parsed.data.storagePath,
        contentType: parsed.data.contentType,
      });
      return NextResponse.json({ post });
    } catch (error) {
      const code = error instanceof Error ? error.message : "upload_failed";
      return NextResponse.json({ error: code }, { status: 500 });
    }
  }

  const form = await request.formData();
  const file = form.get("file");
  const indexRaw = form.get("productIndex");
  if (!(file instanceof File)) return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  const productIndex = Number(indexRaw);
  if (!Number.isInteger(productIndex) || productIndex < 0 || productIndex > 5) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }
  if (file.size > AFFILIATE_BLOG_MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }
  try {
    const prepared = await prepareAffiliateImageUpload({
      postId: id,
      fileName: file.name || "producto.jpg",
      contentType: file.type,
      size: file.size,
    });
    const { getAdminBucket } = await import("@/lib/firebase/admin");
    const bucket = getAdminBucket();
    if (!bucket) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const buffer = Buffer.from(await file.arrayBuffer());
    await bucket.file(prepared.storagePath).save(buffer, {
      contentType: prepared.contentType,
      resumable: false,
    });
    const post = await completeAffiliateImageUpload({
      postId: id,
      productIndex,
      storagePath: prepared.storagePath,
      contentType: prepared.contentType,
    });
    return NextResponse.json({ post });
  } catch (error) {
    const code = error instanceof Error ? error.message : "upload_failed";
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
