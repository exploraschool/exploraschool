import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  buildLanguageAlternates,
  buildLocalizedUrl,
  getSitemapRoutes,
} from "@/lib/sitemap-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getSitemapRoutes();

  return routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url: buildLocalizedUrl(locale, route.path),
      lastModified: route.lastModified ?? new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: buildLanguageAlternates(route.path),
      },
    })),
  );
}
