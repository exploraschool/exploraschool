import { unstable_cache } from "next/cache";
import { getAnalyticsAccessToken } from "@/lib/google-analytics-auth";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

type AdminSummary = {
  accountSummaries?: Array<{
    propertySummaries?: Array<{ property?: string; displayName?: string }>;
  }>;
};

type DataStreamList = {
  dataStreams?: Array<{
    webStreamData?: { measurementId?: string };
  }>;
};

type RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

function envPropertyId(): string {
  return (process.env.GA4_PROPERTY_ID || "").replace(/^properties\//, "").trim();
}

function slugFromPagePath(path: string): string | null {
  const match = path.match(/\/blog\/([^/?#]+)/i);
  if (!match?.[1] || match[1] === "page") return null;
  try {
    return decodeURIComponent(match[1]).replace(/\/+$/, "");
  } catch {
    return match[1];
  }
}

async function gaGet<T>(token: string, url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function discoverPropertyId(token: string): Promise<string> {
  const fromEnv = envPropertyId();
  if (fromEnv) return fromEnv;

  const summaries = await gaGet<AdminSummary>(
    token,
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
  );
  const properties =
    summaries?.accountSummaries?.flatMap((account) => account.propertySummaries ?? []) ?? [];

  if (MEASUREMENT_ID) {
    for (const property of properties) {
      const id = property.property?.replace(/^properties\//, "");
      if (!id) continue;
      const streams = await gaGet<DataStreamList>(
        token,
        `https://analyticsadmin.googleapis.com/v1beta/properties/${id}/dataStreams`,
      );
      const match = streams?.dataStreams?.some(
        (stream) => stream.webStreamData?.measurementId === MEASUREMENT_ID,
      );
      if (match) return id;
    }
  }

  const only = properties[0]?.property?.replace(/^properties\//, "");
  return only || "";
}

async function runBlogReport(token: string, propertyId: string): Promise<Record<string, number>> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "CONTAINS", value: "/blog/" },
          },
        },
        limit: 10000,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("[ga4] runReport failed:", res.status, text.slice(0, 240));
    return {};
  }
  const json = (await res.json()) as RunReportResponse;
  const views: Record<string, number> = {};
  for (const row of json.rows ?? []) {
    const slug = slugFromPagePath(row.dimensionValues?.[0]?.value || "");
    if (!slug) continue;
    const count = Number(row.metricValues?.[0]?.value || 0);
    if (!Number.isFinite(count)) continue;
    views[slug] = (views[slug] || 0) + count;
  }
  return views;
}

async function fetchGa4BlogViewsUncached(): Promise<Record<string, number>> {
  const token = await getAnalyticsAccessToken();
  if (!token) return {};
  const propertyId = await discoverPropertyId(token);
  if (!propertyId) {
    console.warn("[ga4] no property id — set GA4_PROPERTY_ID or add the service account as Viewer");
    return {};
  }
  return runBlogReport(token, propertyId);
}

export const getGa4BlogViews = unstable_cache(fetchGa4BlogViewsUncached, ["ga4-blog-views"], {
  revalidate: 3600,
});
