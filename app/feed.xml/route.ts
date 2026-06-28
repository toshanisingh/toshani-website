import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteConfig.url;
  let pages: { title: string; slug: string; excerpt: string | null; publishedAt: Date | null; section: { slug: string } }[] = [];
  try {
    pages = await prisma.page.findMany({
      where: { draft: false, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: { section: true },
    });
  } catch (err) {
    console.error("[feed] failed to load:", err);
  }

  const items = pages
    .map((p) => {
      const link = `${base}/${p.section.slug}/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>${
        p.excerpt ? `\n      <description>${escapeXml(p.excerpt)}</description>` : ""
      }${p.publishedAt ? `\n      <pubDate>${p.publishedAt.toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
