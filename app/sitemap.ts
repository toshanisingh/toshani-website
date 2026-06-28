import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

// Regenerated on a schedule; degrades to just the homepage if the DB is
// unavailable at build (so it never fails the build).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.3 },
  ];

  try {
    const [sections, pages, tags] = await Promise.all([
      prisma.section.findMany(),
      prisma.page.findMany({
        where: { draft: false, publishedAt: { not: null } },
        include: { section: true },
      }),
      prisma.tag.findMany({
        where: { pages: { some: { draft: false, publishedAt: { not: null } } } },
      }),
    ]);

    for (const s of sections) {
      entries.push({ url: `${base}/${s.slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const p of pages) {
      entries.push({
        url: `${base}/${p.section.slug}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const t of tags) {
      entries.push({ url: `${base}/tags/${t.slug}`, changeFrequency: "weekly", priority: 0.3 });
    }
  } catch (err) {
    console.error("[sitemap] failed to load DB entries:", err);
  }

  return entries;
}
