"use client";

import { useEffect, useState, useTransition } from "react";
import { react, type ReactionTarget, type ReactionType } from "@/app/reactions/actions";
import type { ReactionCounts } from "@/lib/reactions";

// "mine" (which reaction this visitor made) is kept in localStorage so the
// surrounding page can be statically cached — server dedup still uses the
// visitor cookie, this is purely for highlighting.
export function ReactionBar({
  targetType,
  targetId,
  initial,
  prompt = "Enjoyed this?",
}: {
  targetType: ReactionTarget;
  targetId: string;
  initial: ReactionCounts;
  prompt?: string;
}) {
  const [counts, setCounts] = useState<ReactionCounts>(initial);
  const [mine, setMine] = useState<ReactionType | null>(null);
  const [pending, start] = useTransition();
  const key = `tr:${targetType}:${targetId}`;

  useEffect(() => {
    try {
      const m = localStorage.getItem(key);
      if (m === "LIKE" || m === "LOVE") setMine(m);
    } catch {
      // localStorage unavailable — highlight just stays off
    }
  }, [key]);

  const click = (type: ReactionType) =>
    start(async () => {
      const r = await react(targetType, targetId, type);
      setCounts({ like: r.like, love: r.love });
      setMine(r.mine);
      try {
        if (r.mine) localStorage.setItem(key, r.mine);
        else localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });

  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">{prompt}</span>
      <button
        type="button"
        disabled={pending}
        aria-pressed={mine === "LIKE"}
        onClick={() => click("LIKE")}
        className={`${base} ${
          mine === "LIKE"
            ? "border-primary bg-primary/10 text-primary"
            : "border-sky-edge text-muted hover:bg-sky-soft hover:text-primary"
        }`}
      >
        <span aria-hidden>👍</span> Like <span className="tabular-nums">{counts.like}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        aria-pressed={mine === "LOVE"}
        onClick={() => click("LOVE")}
        className={`${base} ${
          mine === "LOVE"
            ? "border-rose-400 bg-rose-50 text-rose-600"
            : "border-sky-edge text-muted hover:bg-sky-soft hover:text-rose-500"
        }`}
      >
        <span aria-hidden>❤️</span> Love <span className="tabular-nums">{counts.love}</span>
      </button>
    </div>
  );
}
