"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

export function ReplyToggle({ pageId, parentId }: { pageId: string; parentId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-muted hover:text-primary"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2">
      <CommentForm pageId={pageId} parentId={parentId} compact onDone={() => setOpen(false)} />
    </div>
  );
}
