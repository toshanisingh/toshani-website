"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { Editor } from "@/components/editor/Editor";
import { updateSection } from "./actions";

const label = "block text-sm font-medium text-ink";
const input =
  "mt-1 w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function SectionForm({
  initial,
}: {
  initial: { id: string; name: string; slug: string; body: JSONContent | null };
}) {
  const [error, formAction, isPending] = useActionState(updateSection, undefined);
  const [body, setBody] = useState<JSONContent>(initial.body ?? {});

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Name</label>
          <input id="name" name="name" required defaultValue={initial.name} className={input} />
        </div>
        <div>
          <label htmlFor="slug" className={label}>
            Slug <span className="text-muted">(changing it changes the URL)</span>
          </label>
          <input id="slug" name="slug" defaultValue={initial.slug} className={input} />
        </div>
      </div>

      <div>
        <span className={label}>
          Content <span className="text-muted">(optional — shown on the section page, e.g. an About Me bio)</span>
        </span>
        <div className="mt-1">
          <Editor initial={initial.body ?? null} onChange={setBody} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save section"}
        </button>
        <Link href="/admin/sections" className="text-sm text-muted hover:text-primary">
          Back to sections
        </Link>
      </div>
    </form>
  );
}
