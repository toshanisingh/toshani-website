import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getReactionCounts } from "@/lib/reactions";
import { PageCard } from "@/components/PageCard";
import { ShareBar } from "@/components/ShareBar";
import { ReactionBar } from "@/components/ReactionBar";

// ISR-cached (no cookie/searchParams in render).
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const tags = await prisma.tag.findMany({
      where: { pages: { some: { draft: false, publishedAt: { not: null } } } },
      select: { slug: true },
    });
    return tags.map((t) => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

const getTag = cache((slug: string) =>
  prisma.tag.findUnique({
    where: { slug },
    include: {
      pages: {
        where: { draft: false, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        include: { section: true, tags: true },
      },
    },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};
  return {
    title: `#${tag.name}`,
    description: `Posts tagged ${tag.name}`,
    openGraph: { title: `#${tag.name}`, type: "website" },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  const reactions = await getReactionCounts("TAG", tag.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Tag</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">#{tag.name}</h1>
        </div>
        <ShareBar title={`#${tag.name}`} />
      </header>

      <ReactionBar targetType="TAG" targetId={tag.id} initial={reactions} prompt="Like this tag?" />

      {tag.pages.length === 0 ? (
        <p className="text-muted">No published posts with this tag.</p>
      ) : (
        <ul className="space-y-5">
          {tag.pages.map((p) => (
            <PageCard key={p.id} page={p} showSection />
          ))}
        </ul>
      )}
    </div>
  );
}
