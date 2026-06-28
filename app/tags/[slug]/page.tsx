import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageCard } from "@/components/PageCard";

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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-accent">Tag</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">#{tag.name}</h1>
      </header>

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
