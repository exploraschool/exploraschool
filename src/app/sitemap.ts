import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { routing } from "@/i18n/routing";
import { blogPosts } from "@/data/blog";
import { getActiveInstructors } from "@/data/instructors";

const staticPaths = [
  "",
  "/clases",
  "/equipo",
  "/blog",
  "/preguntas-frecuentes",
  "/contacto",
  "/club",
  "/como-llegar",
  "/aviso-legal",
  "/politica-de-privacidad",
  "/politica-de-cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.domain;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }

    for (const post of blogPosts) {
      entries.push({
        url: `${base}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const instructor of getActiveInstructors()) {
      entries.push({
        url: `${base}/${locale}/equipo/${instructor.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
