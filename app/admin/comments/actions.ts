"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

async function revalidatePostFor(commentId: string) {
  const c = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { page: { include: { section: true } } },
  });
  if (c) revalidatePath(`/${c.page.section.slug}/${c.page.slug}`);
  revalidatePath("/admin/comments");
  return c;
}

export async function approveComment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) return;
  await prisma.comment.update({ where: { id }, data: { status: "APPROVED" } });
  await revalidatePostFor(id);
}

export async function markSpam(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) return;
  await prisma.comment.update({ where: { id }, data: { status: "SPAM" } });
  await revalidatePostFor(id);
}

export async function deleteComment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) return;
  // Capture the page path before deletion (cascades replies + likes).
  const c = await prisma.comment.findUnique({
    where: { id },
    include: { page: { include: { section: true } } },
  });
  await prisma.comment.delete({ where: { id } });
  if (c) revalidatePath(`/${c.page.section.slug}/${c.page.slug}`);
  revalidatePath("/admin/comments");
}
