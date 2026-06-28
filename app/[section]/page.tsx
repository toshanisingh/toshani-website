import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageCard } from "@/components/PageCard";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ tag?: string; sort?: string }>;
};

const getSectionBySlug = cache((slug: string) =>
  prisma.section.findUnique({ where: { slug } }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const s = await getSectionBySlug(section);
  if (!s) return {};
  return {
    title: s.name,
    description: `${s.name} — Toshani`,
    openGraph: { title: s.name, type: "website" },
  };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const { tag, sort } = await searchParams;
  const s = await getSectionBySlug(section);
  if (!s) notFound();

  const publishedFilter = { draft: false, publishedAt: { not: null } } as const;

  const [pages, tags] = await Promise.all([
    prisma.page.findMany({
      where: {
        sectionId: s.id,
        ...publishedFilter,
        ...(tag ? { tags: { some: { slug: tag } } } : {}),
      },
      orderBy: { publishedAt: sort === "oldest" ? "asc" : "desc" },
      include: { section: true, tags: true },
    }),
    // Tags that actually appear on published pages in this section.
    prisma.tag.findMany({
      where: { pages: { some: { sectionId: s.id, ...publishedFilter } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const sortHref = (next: string) => {
    const sp = new URLSearchParams();
    if (tag) sp.set("tag", tag);
    if (next) sp.set("sort", next);
    const qs = sp.toString();
    return `/${s.slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{s.name}</h1>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted">Sort:</span>
          <Link href={sortHref("")} className={sort !== "oldest" ? "font-semibold text-primary" : "text-muted hover:text-primary"}>
            Newest
          </Link>
          <span className="text-muted">·</span>
          <Link href={sortHref("oldest")} className={sort === "oldest" ? "font-semibold text-primary" : "text-muted hover:text-primary"}>
            Oldest
          </Link>
        </div>
      </header>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${s.slug}${sort === "oldest" ? "?sort=oldest" : ""}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${!tag ? "bg-primary text-white" : "bg-sky-soft text-accent hover:bg-sky-edge"}`}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/${s.slug}?tag=${t.slug}${sort === "oldest" ? "&sort=oldest" : ""}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${tag === t.slug ? "bg-primary text-white" : "bg-sky-soft text-accent hover:bg-sky-edge"}`}
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {pages.length === 0 ? (
        <p className="text-muted">
          {tag ? "No posts with this tag yet." : "Nothing published here yet — check back soon."}
        </p>
      ) : (
        <ul className="space-y-5">
          {pages.map((p) => (
            <PageCard key={p.id} page={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
