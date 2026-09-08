import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  buildLanguageAlternates,
  buildLocalizedUrl,
  getSitemapRoutes,
} from "@/lib/sitemap-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const routes = await getSitemapRoutes();
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
  } catch {
    return [];
  }
}
