import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deletePage } from "./actions";

export default async function PagesAdmin() {
  await requireAdmin();
  const [pages, sectionCount] = await Promise.all([
    prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      include: { section: true },
    }),
    prisma.section.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Pages</h1>
        {sectionCount > 0 && (
          <Link
            href="/admin/pages/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            New page
          </Link>
        )}
      </div>

      {sectionCount === 0 ? (
        <p className="text-sm text-muted">
          Create a{" "}
          <Link href="/admin/sections" className="font-medium text-primary hover:underline">
            section
          </Link>{" "}
          first — pages live inside sections.
        </p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-muted">No pages yet. Create your first one.</p>
      ) : (
        <ul className="space-y-3">
          {pages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-edge/60 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{p.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.draft ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.draft ? "Draft" : "Published"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  /{p.section.slug}/{p.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!p.draft && (
                  <Link
                    href={`/${p.section.slug}/${p.slug}`}
                    className="rounded-md border border-sky-edge px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/pages/${p.id}/edit`}
                  className="rounded-md border border-sky-edge px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary"
                >
                  Edit
                </Link>
                <form action={deletePage}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton
                    message={`Delete “${p.title}”? This cannot be undone.`}
                    className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
