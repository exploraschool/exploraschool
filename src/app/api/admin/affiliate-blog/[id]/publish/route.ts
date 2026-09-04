import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/admin-auth";
import { publishAffiliatePost, unpublishAffiliatePost } from "@/lib/affiliate-blog";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  action: z.enum(["publish", "unpublish"]).default("publish"),
});

export async function POST(request: Request, { params }: Ctx) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({ action: "publish" })));
  const action = parsed.success ? parsed.data.action : "publish";
  try {
    const post =
      action === "unpublish" ? await unpublishAffiliatePost(id) : await publishAffiliatePost(id);
    return NextResponse.json({ post });
  } catch (error) {
    const code = error instanceof Error ? error.message : "publish_failed";
    const status = code === "not_found" ? 404 : code === "not_ready" ? 400 : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
