import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/admin-auth";
import { getAffiliatePost, isAffiliatePostReadyToGenerate, syncAffiliateGalleriesFromAmazon } from "@/lib/affiliate-blog";
import { generateAffiliateArticle } from "@/lib/affiliate-blog-gemini";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await getAffiliatePost(id);
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!isAffiliatePostReadyToGenerate(post)) {
    return NextResponse.json({ error: "not_ready" }, { status: 400 });
  }
  try {
    const synced = await syncAffiliateGalleriesFromAmazon(post);
    const generated = await generateAffiliateArticle(synced);
    return NextResponse.json({ post: generated });
  } catch (error) {
    console.error("[affiliate-blog/generate]", error);
    const code = error instanceof Error ? error.message : "generate_failed";
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
