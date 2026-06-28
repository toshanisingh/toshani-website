"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitComment, type SubmitState } from "@/app/comments/actions";

// Admin reply used inside the moderation panel. No name field — the server sets
// the author to the site name and marks it as an approved admin reply.
export function AdminReplyForm({ pageId, parentId }: { pageId: string; parentId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitComment, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      ref.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-primary hover:underline">
        Reply
      </button>
    );
  }

  return (
    <form ref={ref} action={action} className="mt-2 space-y-2">
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="parentId" value={parentId} />
      <textarea
        name="body"
        required
        maxLength={3000}
        rows={2}
        placeholder="Reply as author…"
        className="w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {pending ? "Posting…" : "Post reply"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-primary">
          Cancel
        </button>
      </div>
    </form>
  );
}
