import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Account setup",
  robots: { index: false, follow: false },
};

export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-sky-edge/60 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Set up / reset password
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          First time here, or forgot your password? Enter the admin email and
          we&apos;ll send a one-time link to set a new password.
        </p>
        <ForgotForm />
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
