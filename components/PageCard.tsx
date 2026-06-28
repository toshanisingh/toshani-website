import Link from "next/link";

type CardPage = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  section: { name: string; slug: string };
  tags?: { name: string; slug: string }[];
};

// Shared listing card used by section, tag, and search pages.
export function PageCard({ page, showSection }: { page: CardPage; showSection?: boolean }) {
  return (
    <li className="rounded-xl border border-sky-edge/60 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm">
      {showSection && (
        <Link href={`/${page.section.slug}`} className="text-xs font-medium text-accent hover:underline">
          {page.section.name}
        </Link>
      )}
      <Link href={`/${page.section.slug}/${page.slug}`} className="mt-0.5 block">
        <h2 className="text-lg font-semibold text-primary">{page.title}</h2>
        {page.excerpt && <p className="mt-1 text-sm text-muted">{page.excerpt}</p>}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {page.publishedAt && (
          <time dateTime={page.publishedAt.toISOString()} className="text-xs text-muted">
            {page.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        )}
        {page.tags && page.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {page.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="rounded-full bg-sky-soft px-2 py-0.5 text-xs font-medium text-accent hover:bg-sky-edge"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
