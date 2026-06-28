import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderContent } from "@/lib/render-content";
import { getReactionState } from "@/lib/reactions";
import { ShareBar } from "@/components/ShareBar";
import { ReactionBar } from "@/components/ReactionBar";

type Props = { params: Promise<{ section: string; slug: string }> };

// Only published, non-draft pages are public. Deduped across metadata + render.
const getPage = cache((sectionSlug: string, slug: string) =>
  prisma.page.findFirst({
    where: {
      slug,
      draft: false,
      publishedAt: { not: null },
      section: { slug: sectionSlug },
    },
    include: { section: true, tags: true },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const page = await getPage(section, slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.excerpt ?? undefined,
    openGraph: {
      title: page.title,
      description: page.excerpt ?? undefined,
      type: "article",
      publishedTime: page.publishedAt?.toISOString(),
      images: page.coverImageUrl ? [page.coverImageUrl] : undefined,
    },
    twitter: {
      card: page.coverImageUrl ? "summary_large_image" : "summary",
      title: page.title,
      description: page.excerpt ?? undefined,
      images: page.coverImageUrl ? [page.coverImageUrl] : undefined,
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const { section, slug } = await params;
  const page = await getPage(section, slug);
  if (!page) notFound();

  const html = renderContent(page.body);
  const reactions = await getReactionState("PAGE", page.id);

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-accent">{page.section.name}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {page.title}
      </h1>
      {page.publishedAt && (
        <time
          dateTime={page.publishedAt.toISOString()}
          className="mt-2 block text-sm text-muted"
        >
          {page.publishedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div className="mt-5">
        <ShareBar title={page.title} />
      </div>

      {page.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.coverImageUrl}
          alt=""
          className="mt-6 w-full rounded-xl border border-sky-edge/60"
        />
      )}

      <div
        className="prose-article mt-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {page.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-sky-edge/60 pt-6">
          {page.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="rounded-full bg-sky-soft px-3 py-1 text-sm font-medium text-accent hover:bg-sky-edge"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-sky-edge/60 pt-6">
        <ReactionBar targetType="PAGE" targetId={page.id} initial={reactions} />
      </div>
    </article>
  );
}
