import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ section: string }> };

// Deduped across generateMetadata + the page render within one request.
const getSection = cache((slug: string) =>
  prisma.section.findUnique({
    where: { slug },
    include: {
      pages: {
        where: { draft: false, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
      },
    },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const s = await getSection(section);
  if (!s) return {};
  return {
    title: s.name,
    description: `${s.name} — Toshani`,
    openGraph: { title: s.name, type: "website" },
  };
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const s = await getSection(section);
  if (!s) notFound();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{s.name}</h1>
      </header>

      {s.pages.length === 0 ? (
        <p className="text-muted">Nothing published here yet — check back soon.</p>
      ) : (
        <ul className="space-y-5">
          {s.pages.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-sky-edge/60 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <Link href={`/${s.slug}/${p.slug}`} className="block">
                <h2 className="text-lg font-semibold text-primary">{p.title}</h2>
                {p.excerpt && <p className="mt-1 text-sm text-muted">{p.excerpt}</p>}
                {p.publishedAt && (
                  <time
                    dateTime={p.publishedAt.toISOString()}
                    className="mt-2 block text-xs text-muted"
                  >
                    {p.publishedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
