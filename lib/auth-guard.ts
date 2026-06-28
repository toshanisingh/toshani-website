import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Server-side admin gate. Call this at the top of every admin page AND every
// mutating server action — middleware only guards page navigations, not direct
// server-action / route-handler invocations (PLAN.md requirement #1).
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}
