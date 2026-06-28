import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getSections } from "@/lib/sections";
import { PageForm } from "../../PageForm";
import { updatePage } from "../../actions";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [page, sections] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    getSections(),
  ]);
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Edit page</h1>
      <PageForm
        action={updatePage}
        sections={sections}
        initial={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          sectionId: page.sectionId,
          excerpt: page.excerpt,
          coverImageUrl: page.coverImageUrl,
          body: page.body as JSONContent,
          published: !page.draft,
        }}
      />
    </div>
  );
}
