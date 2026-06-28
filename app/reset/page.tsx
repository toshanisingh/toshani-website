import type { Metadata } from "next";
import Link from "next/link";
import { verifyResetToken } from "@/lib/reset-token";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Set password",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyResetToken(token) : { valid: false as const };

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-sky-edge/60 bg-white p-8 shadow-sm">
        {result.valid ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Choose a password
            </h1>
            <p className="mt-1 mb-6 text-sm text-muted">
              Set the password for your admin account.
            </p>
            <ResetForm token={token!} />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Link expired or invalid
            </h1>
            <p className="mt-1 mb-6 text-sm text-muted">
              This setup link is no longer valid. Request a fresh one to continue.
            </p>
            <Link
              href="/forgot"
              className="inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
