"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";

async function uniquePageSlug(
  sectionId: string,
  desired: string,
  exceptId?: string,
): Promise<string> {
  const base = slugify(desired);
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.page.findFirst({
      where: { sectionId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${n++}`;
  }
}

const COVER_SIZES = new Set(["small", "medium", "large", "full"]);
function coverSizeOf(formData: FormData): string {
  const v = formData.get("coverSize") as string | null;
  return v && COVER_SIZES.has(v) ? v : "full";
}

function parseBody(raw: FormDataEntryValue | null): object {
  if (typeof raw !== "string" || !raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Parse the comma-separated tags field, upsert each tag (keyed by slug), and
// return their ids for connecting to the page.
async function syncTags(raw: FormDataEntryValue | null): Promise<{ id: string }[]> {
  if (typeof raw !== "string") return [];
  const names = [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
  const ids: { id: string }[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.push({ id: tag.id });
  }
  return ids;
}

function revalidate(sectionSlug: string, pageSlug?: string) {
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  revalidatePath(`/${sectionSlug}`);
  if (pageSlug) revalidatePath(`/${sectionSlug}/${pageSlug}`);
}

type FormState = string | undefined;

export async function createPage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const title = (formData.get("title") as string | null)?.trim();
  const sectionId = formData.get("sectionId") as string | null;
  if (!title) return "Please enter a title.";
  if (!sectionId) return "Please choose a section.";

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) return "That section no longer exists.";

  const desiredSlug = ((formData.get("slug") as string | null)?.trim() || title);
  const slug = await uniquePageSlug(sectionId, desiredSlug);
  const published = formData.get("published") === "on";
  const tagIds = await syncTags(formData.get("tags"));

  const page = await prisma.page.create({
    data: {
      sectionId,
      title,
      slug,
      body: parseBody(formData.get("body")),
      excerpt: (formData.get("excerpt") as string | null)?.trim() || null,
      coverImageUrl: (formData.get("coverImageUrl") as string | null)?.trim() || null,
      coverSize: coverSizeOf(formData),
      draft: !published,
      publishedAt: published ? new Date() : null,
      tags: { connect: tagIds },
    },
  });

  revalidate(section.slug, page.slug);
  redirect("/admin/pages");
}

export async function updatePage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string | null)?.trim();
  const sectionId = formData.get("sectionId") as string | null;
  if (!id) return "Missing page id.";
  if (!title) return "Please enter a title.";
  if (!sectionId) return "Please choose a section.";

  const [existing, section] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    prisma.section.findUnique({ where: { id: sectionId } }),
  ]);
  if (!existing) return "That page no longer exists.";
  if (!section) return "That section no longer exists.";

  const desiredSlug = ((formData.get("slug") as string | null)?.trim() || title);
  const slug = await uniquePageSlug(sectionId, desiredSlug, id);
  const published = formData.get("published") === "on";
  const tagIds = await syncTags(formData.get("tags"));

  const page = await prisma.page.update({
    where: { id },
    data: {
      sectionId,
      title,
      slug,
      body: parseBody(formData.get("body")),
      excerpt: (formData.get("excerpt") as string | null)?.trim() || null,
      coverImageUrl: (formData.get("coverImageUrl") as string | null)?.trim() || null,
      coverSize: coverSizeOf(formData),
      draft: !published,
      // Set the publish date on first publish; preserve it afterwards.
      publishedAt: published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      tags: { set: tagIds }, // replace the page's tags with the submitted set
    },
  });

  revalidate(section.slug, page.slug);
  redirect("/admin/pages");
}

export async function deletePage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) return;
  const page = await prisma.page.delete({
    where: { id },
    include: { section: true },
  });
  // Reactions are polymorphic (no FK), so clean them up explicitly.
  await prisma.reaction.deleteMany({ where: { targetType: "PAGE", targetId: id } });
  revalidate(page.section.slug, page.slug);
}
