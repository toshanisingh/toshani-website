"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSection } from "./actions";

export function AddSectionForm() {
  const [error, formAction, isPending] = useActionState(createSection, undefined);
  const ref = useRef<HTMLFormElement>(null);

  // Clear the input after a successful add (no error returned).
  useEffect(() => {
    if (!isPending && !error) ref.current?.reset();
  }, [isPending, error]);

  return (
    <form ref={ref} action={formAction} className="flex flex-wrap items-start gap-3">
      <div className="flex-1">
        <input
          name="name"
          placeholder="New section name (e.g. Blogs)"
          required
          className="w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {error && (
          <p className="mt-1 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add section"}
      </button>
    </form>
  );
}
