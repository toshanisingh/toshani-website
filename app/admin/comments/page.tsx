import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AdminReplyForm } from "@/components/comments/AdminReplyForm";
import { approveComment, markSpam, deleteComment } from "./actions";

function Meta({ c }: { c: { authorName: string; authorEmail: string | null; createdAt: Date; page: { title: string; slug: string; section: { slug: string } } } }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span className="font-semibold text-ink">{c.authorName}</span>
      {c.authorEmail && <span>{c.authorEmail}</span>}
      <span>{c.createdAt.toLocaleString("en-US")}</span>
      <Link href={`/${c.page.section.slug}/${c.page.slug}#comments`} className="text-accent hover:underline">
        on “{c.page.title}”
      </Link>
    </div>
  );
}

export default async function CommentsAdmin() {
  await requireAdmin();
  const include = { page: { include: { section: true } } } as const;
  const [pending, approved] = await Promise.all([
    prisma.comment.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, include }),
    prisma.comment.findMany({ where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 50, include }),
  ]);

  const btn = "rounded-md border px-2.5 py-1.5 text-sm font-medium";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Comments</h1>
        <p className="mt-1 text-sm text-muted">Approve, reply to, or remove reader comments.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">
          Pending {pending.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{pending.length}</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Nothing waiting for review.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="rounded-xl border border-amber-200 bg-white p-4">
                <Meta c={c} />
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{c.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={approveComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={`${btn} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>Approve</button>
                  </form>
                  <form action={markSpam}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={`${btn} border-sky-edge text-muted hover:bg-sky-soft`}>Mark spam</button>
                  </form>
                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message="Delete this comment permanently?" className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}>
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Approved</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-muted">No approved comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {approved.map((c) => (
              <li key={c.id} className="rounded-xl border border-sky-edge/60 bg-white p-4">
                <Meta c={c} />
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{c.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <AdminReplyForm pageId={c.pageId} parentId={c.id} />
                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message="Delete this comment (and its replies) permanently?" className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}>
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
