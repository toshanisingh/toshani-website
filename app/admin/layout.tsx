import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

// Middleware already guards /admin, but we re-check here so server components
// can rely on a session and to fail closed if middleware is ever misconfigured.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-sky-edge/60 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-lg font-bold text-primary">
            Admin
          </Link>
          <span className="text-sm text-muted">{session.user?.email}</span>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-sky-edge px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-sky-soft hover:text-primary"
          >
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
