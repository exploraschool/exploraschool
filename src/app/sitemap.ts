import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  buildLanguageAlternates,
  buildLocalizedUrl,
  getSitemapRoutes,
  getStaticSitemapFallbackRoutes,
} from "@/lib/sitemap-routes";

function toSitemapEntries(
  routes: Awaited<ReturnType<typeof getSitemapRoutes>>,
): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    routes.map((route) => {
      const path = route.pathForLocale?.(locale) ?? route.path;
      const entry: MetadataRoute.Sitemap[number] = {
        url: buildLocalizedUrl(locale, path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: buildLanguageAlternates(route),
        },
      };
      if (route.lastModified) entry.lastModified = route.lastModified;
      return entry;
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const routes = await getSitemapRoutes();
    return toSitemapEntries(routes);
  } catch (error) {
    console.error("[sitemap] Failed to build full sitemap; using static fallback.", error);
    return toSitemapEntries(getStaticSitemapFallbackRoutes());
  }
}
