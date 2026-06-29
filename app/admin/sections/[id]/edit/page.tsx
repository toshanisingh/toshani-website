import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { SectionForm } from "../../SectionForm";

export default async function EditSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Edit section</h1>
      <SectionForm
        initial={{
          id: section.id,
          name: section.name,
          slug: section.slug,
          body: section.body as JSONContent,
        }}
      />
    </div>
  );
}
