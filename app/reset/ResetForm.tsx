"use client";

import { useActionState } from "react";
import { setPassword } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const [error, formAction, isPending] = useActionState(setPassword, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-ink">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-sky-edge bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
