import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  // Already signed in? Skip the form.
  const session = await auth();
  if (session) redirect("/admin");

  const { reset } = await searchParams;

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-sky-edge/60 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Restricted area — only the site owner can sign in.
        </p>
        {reset && (
          <p
            className="mb-5 rounded-md bg-sky-soft px-3 py-2 text-sm font-medium text-ink"
            role="status"
          >
            Password set. You can sign in now.
          </p>
        )}
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/forgot" className="font-medium text-primary hover:underline">
            First time, or forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
