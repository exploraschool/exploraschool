import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getGa4BlogViews } from "@/lib/ga4-blog-views";

export const BLOG_VIEW_COLLECTION = "blogViewCounts";

export async function getLocalBlogViews(): Promise<Record<string, number>> {
  if (!isAdminConfigured()) return {};
  const db = getAdminDb();
  if (!db) return {};
  try {
    const snap = await db.collection(BLOG_VIEW_COLLECTION).get();
    const views: Record<string, number> = {};
    for (const doc of snap.docs) {
      const value = Number((doc.data() as { views?: unknown }).views || 0);
      if (Number.isFinite(value) && value > 0) views[doc.id] = value;
    }
    return views;
  } catch (error) {
    console.warn("[blog-popularity] local views failed:", error);
    return {};
  }
}

export async function incrementBlogView(slug: string): Promise<void> {
  if (!isAdminConfigured()) return;
  const db = getAdminDb();
  if (!db) return;
  await db.collection(BLOG_VIEW_COLLECTION).doc(slug).set(
    {
      views: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function getBlogViewCounts(): Promise<Record<string, number>> {
  const [ga4, local] = await Promise.all([
    getGa4BlogViews().catch(() => ({}) as Record<string, number>),
    getLocalBlogViews(),
  ]);
  const slugs = new Set([...Object.keys(ga4), ...Object.keys(local)]);
  const views: Record<string, number> = {};
  for (const slug of slugs) {
    views[slug] = Math.max(ga4[slug] || 0, local[slug] || 0);
  }
  return views;
}

export function compareByPopularity(
  views: Record<string, number>,
): (a: { slug: string; date: string }, b: { slug: string; date: string }) => number {
  return (a, b) => {
    const byViews = (views[b.slug] || 0) - (views[a.slug] || 0);
    if (byViews !== 0) return byViews;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  };
}
