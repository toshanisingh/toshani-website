import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderContent } from "@/lib/render-content";

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
    include: { section: true },
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
    </article>
  );
}
