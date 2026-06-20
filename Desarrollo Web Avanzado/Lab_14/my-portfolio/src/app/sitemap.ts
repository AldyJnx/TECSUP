import { MetadataRoute } from "next";
import { projects } from "@/content/projects/projects";
import { SITE_CONFIG } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projects/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
