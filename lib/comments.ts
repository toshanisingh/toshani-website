import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "crypto";

export const VISITOR_COOKIE = "toshani_visitor";

// Hash of the client IP (+ AUTH_SECRET) for DB-based rate limiting. Never the
// raw IP, and never exposed.
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 32);
}

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

// Read-only visitor id (safe in Server Component render; undefined if unset).
export async function getVisitorId(): Promise<string | undefined> {
  return (await cookies()).get(VISITOR_COOKIE)?.value;
}

export type CommentRow = {
  id: string;
  parentId: string | null;
  authorName: string;
  body: string;
  isAdmin: boolean;
  likeCount: number;
  createdAt: Date;
};
export type CommentNode = CommentRow & { children: CommentNode[] };

// Assemble a flat list of comments into a parent→children tree (one query, no
// recursion/N+1).
export function buildTree(rows: CommentRow[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: CommentNode[] = [];
  for (const r of rows) {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}
