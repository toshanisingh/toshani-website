import type { CommentNode } from "@/lib/comments";
import { LikeButton } from "./LikeButton";
import { ReplyToggle } from "./ReplyToggle";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Body is rendered as React text nodes (auto-escaped) with newlines → <br>.
// No HTML is ever interpreted, so comments cannot inject markup.
function Body({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

export function CommentItem({
  node,
  pageId,
  likedIds,
  depth = 0,
}: {
  node: CommentNode;
  pageId: string;
  likedIds: Set<string>;
  depth?: number;
}) {
  // Cap visual nesting so deep threads don't march off the screen.
  const indented = depth > 0;

  return (
    <li className={indented ? "border-l border-sky-edge/60 pl-4" : ""}>
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{node.authorName}</span>
          {node.isAdmin && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Author
            </span>
          )}
          <time className="text-xs text-muted">{formatDate(node.createdAt)}</time>
        </div>
        <Body text={node.body} />
        <div className="mt-2 flex items-center gap-3">
          <LikeButton commentId={node.id} initialCount={node.likeCount} initialLiked={likedIds.has(node.id)} />
          <ReplyToggle pageId={pageId} parentId={node.id} />
        </div>
      </div>

      {node.children.length > 0 && (
        <ul className="mt-2 space-y-2">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              pageId={pageId}
              likedIds={likedIds}
              depth={Math.min(depth + 1, 3)}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
