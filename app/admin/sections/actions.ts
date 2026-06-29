"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify, RESERVED_SLUGS } from "@/lib/slug";

function refresh() {
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout"); // refresh the nav everywhere
}

async function uniqueSlug(desired: string, exceptId?: string): Promise<string> {
  const base = slugify(desired);
  let slug = base;
  let n = 2;
  for (;;) {
    const clash =
      RESERVED_SLUGS.has(slug) ||
      (await prisma.section.findFirst({
        where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
        select: { id: true },
      }));
    if (!clash) return slug;
    slug = `${base}-${n++}`;
  }
}

function parseBody(raw: FormDataEntryValue | null): object {
  if (typeof raw !== "string" || !raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function createSection(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return "Please enter a section name.";

  const slug = await uniqueSlug(name);
  const max = await prisma.section.aggregate({ _max: { position: true } });
  await prisma.section.create({
    data: { name, slug, position: (max._max.position ?? 0) + 1 },
  });
  refresh();
  return undefined;
}

export async function updateSection(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string | null)?.trim();
  if (!id) return "Missing section id.";
  if (!name) return "Please enter a section name.";

  const desiredSlug = ((formData.get("slug") as string | null)?.trim() || name);
  const slug = await uniqueSlug(desiredSlug, id);

  await prisma.section.update({
    where: { id },
    data: { name, slug, body: parseBody(formData.get("body")) },
  });
  refresh();
  revalidatePath(`/${slug}`);
  return undefined;
}

export async function deleteSection(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) return;
  // Pages in the section cascade-delete (see schema relation). Reactions are
  // polymorphic (no FK), so remove reactions for the section and its pages.
  const pageIds = (await prisma.page.findMany({ where: { sectionId: id }, select: { id: true } })).map((p) => p.id);
  await prisma.reaction.deleteMany({
    where: {
      OR: [
        { targetType: "SECTION", targetId: id },
        { targetType: "PAGE", targetId: { in: pageIds } },
      ],
    },
  });
  await prisma.section.delete({ where: { id } });
  refresh();
}

export async function moveSection(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const dir = formData.get("dir") as string | null; // "up" | "down"
  if (!id || (dir !== "up" && dir !== "down")) return;

  const all = await prisma.section.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];
  // If positions ever collide, nudge to guarantee a strict swap.
  const [pa, pb] = a.position === b.position ? [b.position + 1, b.position] : [b.position, a.position];
  await prisma.$transaction([
    prisma.section.update({ where: { id: a.id }, data: { position: pa } }),
    prisma.section.update({ where: { id: b.id }, data: { position: pb } }),
  ]);
  refresh();
}
