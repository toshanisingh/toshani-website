"use client";

import { useState, useTransition } from "react";
import { likeComment } from "@/app/comments/actions";

export function LikeButton({
  commentId,
  initialCount,
  initialLiked,
}: {
  commentId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={liked}
      onClick={() =>
        start(async () => {
          const r = await likeComment(commentId);
          setLiked(r.liked);
          setCount(r.count);
        })
      }
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        liked ? "bg-primary/10 text-primary" : "text-muted hover:text-primary"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {count}
    </button>
  );
}
