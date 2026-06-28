import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by tag",
};

// Always reflect the current set of tags (and avoid a build-time DB dependency).
export const dynamic = "force-dynamic";

export default async function TagsIndex() {
  // Tags that have at least one published page, with how many.
  const tags = await prisma.tag.findMany({
    where: { pages: { some: { draft: false, publishedAt: { not: null } } } },
    include: {
      _count: {
        select: { pages: { where: { draft: false, publishedAt: { not: null } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Tags</h1>
      {tags.length === 0 ? (
        <p className="text-muted">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="rounded-full bg-sky-soft px-3 py-1.5 text-sm font-medium text-accent hover:bg-sky-edge"
            >
              #{t.name} <span className="text-muted">({t._count.pages})</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
