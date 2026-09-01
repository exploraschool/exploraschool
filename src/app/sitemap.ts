import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  buildLanguageAlternates,
  buildLocalizedUrl,
  getSitemapRoutes,
} from "@/lib/sitemap-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = getSitemapRoutes();

  return routes.map((route) => ({
    url: buildLocalizedUrl(routing.defaultLocale, route.path),
    lastModified: route.lastModified ?? new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: buildLanguageAlternates(route.path),
    },
  }));
}
