import { prisma } from "@/lib/prisma";
import { buildTree, getVisitorId, type CommentRow } from "@/lib/comments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

// Renders the "Comments" section at the foot of a published page. Only APPROVED
// comments are fetched; pending ones never reach the public.
export async function CommentsSection({ pageId }: { pageId: string }) {
  const comments = await prisma.comment.findMany({
    where: { pageId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      parentId: true,
      authorName: true,
      body: true,
      isAdmin: true,
      likeCount: true,
      createdAt: true,
    },
  });

  // Which of these comments the current visitor has already liked.
  const visitorId = await getVisitorId();
  const likedIds = new Set<string>();
  if (visitorId && comments.length > 0) {
    const likes = await prisma.commentLike.findMany({
      where: { visitorId, commentId: { in: comments.map((c) => c.id) } },
      select: { commentId: true },
    });
    likes.forEach((l) => likedIds.add(l.commentId));
  }

  const tree = buildTree(comments as CommentRow[]);

  return (
    <section id="comments" className="mt-12 border-t border-sky-edge/60 pt-8">
      <h2 className="text-2xl font-bold tracking-tight text-ink">
        Comments {comments.length > 0 && <span className="text-muted">({comments.length})</span>}
      </h2>

      <div className="mt-5 rounded-xl border border-sky-edge/60 bg-sky-softer p-4">
        <CommentForm pageId={pageId} />
      </div>

      {tree.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {tree.map((node) => (
            <CommentItem key={node.id} node={node} pageId={pageId} likedIds={likedIds} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">Be the first to comment.</p>
      )}
    </section>
  );
}
