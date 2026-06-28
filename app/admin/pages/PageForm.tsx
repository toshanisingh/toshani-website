"use client";

import { useActionState, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { Editor } from "@/components/editor/Editor";

type SectionOption = { id: string; name: string };

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  sectionId?: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  body?: JSONContent | null;
  published?: boolean;
  tags?: string[];
};

const label = "block text-sm font-medium text-ink";
const input =
  "mt-1 w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function PageForm({
  action,
  sections,
  initial,
}: {
  action: (prev: string | undefined, formData: FormData) => Promise<string | undefined>;
  sections: SectionOption[];
  initial?: Initial;
}) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const [body, setBody] = useState<JSONContent>(initial?.body ?? {});

  return (
    <form action={formAction} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="body" value={JSON.stringify(body)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={label}>Title</label>
          <input id="title" name="title" required defaultValue={initial?.title} className={input} />
        </div>

        <div>
          <label htmlFor="sectionId" className={label}>Section</label>
          <select id="sectionId" name="sectionId" required defaultValue={initial?.sectionId ?? ""} className={input}>
            <option value="" disabled>Choose a section…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="slug" className={label}>
            Slug <span className="text-muted">(optional — auto from title)</span>
          </label>
          <input id="slug" name="slug" defaultValue={initial?.slug} placeholder="my-post" className={input} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="excerpt" className={label}>
            Excerpt <span className="text-muted">(short summary for listings &amp; sharing)</span>
          </label>
          <input id="excerpt" name="excerpt" defaultValue={initial?.excerpt ?? ""} className={input} />
        </div>

        <div>
          <label htmlFor="coverImageUrl" className={label}>
            Cover image URL <span className="text-muted">(optional)</span>
          </label>
          <input id="coverImageUrl" name="coverImageUrl" defaultValue={initial?.coverImageUrl ?? ""} placeholder="https://…" className={input} />
        </div>

        <div>
          <label htmlFor="tags" className={label}>
            Tags <span className="text-muted">(comma-separated)</span>
          </label>
          <input id="tags" name="tags" defaultValue={initial?.tags?.join(", ") ?? ""} placeholder="travel, books, 2026" className={input} />
        </div>
      </div>

      <div>
        <span className={label}>Content</span>
        <div className="mt-1">
          <Editor initial={initial?.body ?? null} onChange={setBody} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" name="published" defaultChecked={initial?.published} className="h-4 w-4 rounded border-sky-edge text-primary focus:ring-primary/30" />
        Published (visible to readers). Leave unchecked to save as a draft.
      </label>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save page"}
        </button>
      </div>
    </form>
  );
}
