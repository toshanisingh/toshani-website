import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageCard } from "@/components/PageCard";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results =
    query.length > 0
      ? await prisma.page.findMany({
          where: {
            draft: false,
            publishedAt: { not: null },
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
              { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
            ],
          },
          orderBy: { publishedAt: "desc" },
          include: { section: true, tags: true },
        })
      : [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Search</h1>

      <form action="/search" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Search posts and tags…"
          className="w-full rounded-lg border border-sky-edge bg-white px-4 py-2.5 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </form>

      {query.length > 0 && (
        <p className="text-sm text-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <ul className="space-y-5">
          {results.map((p) => (
            <PageCard key={p.id} page={p} showSection />
          ))}
        </ul>
      )}
    </div>
  );
}
