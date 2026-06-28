import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already signed in? Skip the form.
  const session = await auth();
  if (session) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-sky-edge/60 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Restricted area — only the site owner can sign in.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
