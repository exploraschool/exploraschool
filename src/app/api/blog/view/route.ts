import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicBlogPost } from "@/lib/blog-catalog";
import { incrementBlogView } from "@/lib/blog-popularity";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= 20) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const bodySchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function POST(request: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const post = await resolvePublicBlogPost(parsed.data.slug);
  if (!post) return NextResponse.json({ ok: false }, { status: 404 });

  try {
    await incrementBlogView(parsed.data.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.warn("[blog/view] increment failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
