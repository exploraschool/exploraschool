import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/admin-auth";
import {
  deleteAffiliatePost,
  getAffiliatePost,
  saveAffiliatePost,
} from "@/lib/affiliate-blog";
import { toExploraAffiliateUrl, extractAmazonAsin } from "@/lib/amazon-affiliates";
import { fetchAmazonProductMeta } from "@/lib/amazon-product-meta";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await getAffiliatePost(id);
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ post });
}

const patchSchema = z.object({
  productIndex: z.number().int().min(0).max(5).optional(),
  affiliateUrl: z.string().url().max(2000).optional(),
  products: z
    .array(
      z.object({
        index: z.number().int().min(0).max(5),
        affiliateUrl: z.string().max(2000),
      }),
    )
    .optional(),
});

export async function PATCH(request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { id } = await params;
  const post = await getAffiliatePost(id);
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_data" }, { status: 400 });

  let next = post;
  const updates = parsed.data.products
    ? parsed.data.products
    : parsed.data.productIndex != null && parsed.data.affiliateUrl
      ? [{ index: parsed.data.productIndex, affiliateUrl: parsed.data.affiliateUrl }]
      : [];

  for (const update of updates) {
    const product = next.products[update.index];
    if (!product) continue;
    const tagged = toExploraAffiliateUrl(update.affiliateUrl);
    if (!tagged) {
      return NextResponse.json({ error: "invalid_amazon_url" }, { status: 400 });
    }
    const meta = await fetchAmazonProductMeta(tagged);
    const keepUpload = product.imageSource === "upload" && product.imageSrc;
    next = {
      ...next,
      products: next.products.map((item, index) =>
        index === update.index
          ? {
              ...item,
              affiliateUrl: tagged,
              asin: meta.asin || extractAmazonAsin(tagged) || item.asin,
              nameEs: item.nameEs || meta.title,
              nameEn: item.nameEn || meta.title,
              priceText: item.priceText || meta.priceText,
              imageSrc: keepUpload ? item.imageSrc : meta.image || item.imageSrc,
              imageSource: keepUpload ? "upload" : meta.image ? "amazon" : item.imageSource,
            }
          : item,
      ),
    };
    if (!next.coverImage && next.products[0]?.imageSrc) {
      next = { ...next, coverImage: next.products[0].imageSrc };
    }
  }

  const saved = await saveAffiliatePost(next);
  return NextResponse.json({ post: saved });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteAffiliatePost(id);
  return NextResponse.json({ ok: true });
}
