import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const VISITOR_COOKIE = "toshani_visitor";

// Read-or-create the anonymous visitor id. Only callable from a Server Action
// or Route Handler (Server Components can't set cookies).
export async function ensureVisitorId(): Promise<string> {
  const c = await cookies();
  let id = c.get(VISITOR_COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    c.set(VISITOR_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return id;
}

// Read-only visitor id (safe during Server Component render; undefined if unset).
export async function getVisitorId(): Promise<string | undefined> {
  return (await cookies()).get(VISITOR_COOKIE)?.value;
}
