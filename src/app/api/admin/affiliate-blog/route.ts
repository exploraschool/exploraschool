import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/admin-auth";
import { createAffiliatePost, listAffiliatePosts } from "@/lib/affiliate-blog";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable", posts: [] }, { status: 503 });
  }
  const posts = await listAffiliatePosts();
  return NextResponse.json({ posts });
}

const createSchema = z.object({
  type: z.enum(["ranking", "review"]),
});

export async function POST(request: Request) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }
  const post = await createAffiliatePost(parsed.data.type, staff.email);
  return NextResponse.json({ post });
}
