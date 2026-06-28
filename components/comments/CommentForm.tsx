"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitComment, type SubmitState } from "@/app/comments/actions";

const input =
  "w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function CommentForm({
  pageId,
  parentId,
  onDone,
  compact,
}: {
  pageId: string;
  parentId?: string;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitComment,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="pageId" value={pageId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      {/* Honeypot: hidden from humans; bots tend to fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {!compact && (
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="name" placeholder="Name" required maxLength={80} className={input} />
          <input name="email" type="email" placeholder="Email (optional, never shown)" className={input} />
        </div>
      )}
      {compact && (
        <input name="name" placeholder="Name" required maxLength={80} className={input} />
      )}

      <textarea
        name="body"
        required
        maxLength={3000}
        rows={compact ? 2 : 3}
        placeholder={parentId ? "Write a reply…" : "Write a comment…"}
        className={input}
      />

      {state?.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`} role="status">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Posting…" : parentId ? "Reply" : "Post comment"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-muted hover:text-primary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
