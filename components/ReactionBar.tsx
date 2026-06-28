"use client";

import { useState, useTransition } from "react";
import { react, type ReactionState, type ReactionType } from "@/app/reactions/actions";

export function ReactionBar({ pageId, initial }: { pageId: string; initial: ReactionState }) {
  const [state, setState] = useState<ReactionState>(initial);
  const [pending, start] = useTransition();

  const click = (type: ReactionType) =>
    start(async () => {
      setState(await react(pageId, type));
    });

  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">Enjoyed this?</span>
      <button
        type="button"
        disabled={pending}
        aria-pressed={state.mine === "LIKE"}
        onClick={() => click("LIKE")}
        className={`${base} ${
          state.mine === "LIKE"
            ? "border-primary bg-primary/10 text-primary"
            : "border-sky-edge text-muted hover:bg-sky-soft hover:text-primary"
        }`}
      >
        <span aria-hidden>👍</span> Like <span className="tabular-nums">{state.like}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        aria-pressed={state.mine === "LOVE"}
        onClick={() => click("LOVE")}
        className={`${base} ${
          state.mine === "LOVE"
            ? "border-rose-400 bg-rose-50 text-rose-600"
            : "border-sky-edge text-muted hover:bg-sky-soft hover:text-rose-500"
        }`}
      >
        <span aria-hidden>❤️</span> Love <span className="tabular-nums">{state.love}</span>
      </button>
    </div>
  );
}
