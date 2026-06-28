import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

// Count pending comments for the nav badge. Resilient: returns 0 if the table
// doesn't exist yet (e.g. before the comments migration is applied).
async function pendingCommentCount(): Promise<number> {
  try {
    return await prisma.comment.count({ where: { status: "PENDING" } });
  } catch {
    return 0;
  }
}

// Middleware already guards /admin, but we re-check here so server components
// can rely on a session and to fail closed if middleware is ever misconfigured.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const pending = await pendingCommentCount();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-sky-edge/60 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-lg font-bold text-primary">
            Admin
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/admin/sections" className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary">
              Sections
            </Link>
            <Link href="/admin/pages" className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary">
              Pages
            </Link>
            <Link href="/admin/comments" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary">
              Comments
              {pending > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{pending}</span>
              )}
            </Link>
          </nav>
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
