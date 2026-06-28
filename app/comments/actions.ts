"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { siteConfig } from "@/lib/site";
import { clientIpHash, ensureVisitorId } from "@/lib/comments";

export type SubmitState = { ok: boolean; message: string } | undefined;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5; // comments per window per IP (non-admin)

export async function submitComment(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const honeypot = (formData.get("website") as string | null) ?? "";
  // Bot filled the hidden field — pretend success, store nothing.
  if (honeypot.trim() !== "") {
    return { ok: true, message: "Thanks — your comment is awaiting approval." };
  }

  const pageId = formData.get("pageId") as string | null;
  const parentId = (formData.get("parentId") as string | null) || null;
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const email = ((formData.get("email") as string | null) ?? "").trim() || null;
  const body = ((formData.get("body") as string | null) ?? "").trim();

  // isAdmin is derived from the session ONLY — never trust a client field.
  const session = await auth();
  const isAdmin = !!session?.user;

  if (!pageId) return { ok: false, message: "Something went wrong." };
  if (!isAdmin && (name.length < 1 || name.length > 80))
    return { ok: false, message: "Please enter your name (under 80 characters)." };
  if (body.length < 1 || body.length > 3000)
    return { ok: false, message: "Comment must be between 1 and 3000 characters." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, message: "That email address doesn't look right." };

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { section: true },
  });
  if (!page) return { ok: false, message: "Page not found." };

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.pageId !== page.id || parent.status !== "APPROVED")
      return { ok: false, message: "You can't reply to that comment." };
  }

  const ipHash = await clientIpHash();
  if (!isAdmin) {
    const recent = await prisma.comment.count({
      where: { ipHash, createdAt: { gt: new Date(Date.now() - RATE_WINDOW_MS) } },
    });
    if (recent >= RATE_MAX)
      return { ok: false, message: "You're commenting too quickly — please wait a few minutes." };
  }

  await ensureVisitorId();
  await prisma.comment.create({
    data: {
      pageId: page.id,
      parentId,
      authorName: isAdmin ? siteConfig.name : name,
      authorEmail: isAdmin ? null : email,
      body,
      isAdmin,
      status: isAdmin ? "APPROVED" : "PENDING",
      ipHash,
    },
  });

  if (isAdmin) {
    revalidatePath(`/${page.section.slug}/${page.slug}`);
    return { ok: true, message: "Reply posted." };
  }
  return { ok: true, message: "Thanks — your comment is awaiting approval." };
}

export async function likeComment(
  commentId: string,
): Promise<{ liked: boolean; count: number }> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.status !== "APPROVED") {
    return { liked: false, count: comment?.likeCount ?? 0 };
  }

  const visitorId = await ensureVisitorId();
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_visitorId: { commentId, visitorId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.commentLike.delete({ where: { id: existing.id } }),
      prisma.comment.update({ where: { id: commentId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return { liked: false, count: Math.max(0, comment.likeCount - 1) };
  }

  await prisma.$transaction([
    prisma.commentLike.create({ data: { commentId, visitorId } }),
    prisma.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } }),
  ]);
  return { liked: true, count: comment.likeCount + 1 };
}
