"use client";

import { useActionState } from "react";
import { requestReset } from "./actions";

export function ForgotForm() {
  const [message, formAction, isPending] = useActionState(requestReset, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Admin email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-1 w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {message && (
        <p className="rounded-md bg-sky-soft px-3 py-2 text-sm font-medium text-ink" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send setup link"}
      </button>
    </form>
  );
}
