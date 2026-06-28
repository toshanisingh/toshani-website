import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { getSections } from "@/lib/sections";
import { PageForm } from "../PageForm";
import { createPage } from "../actions";

export default async function NewPage() {
  await requireAdmin();
  const sections = await getSections();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">New page</h1>
      {sections.length === 0 ? (
        <p className="text-sm text-muted">
          Create a{" "}
          <Link href="/admin/sections" className="font-medium text-primary hover:underline">
            section
          </Link>{" "}
          first.
        </p>
      ) : (
        <PageForm action={createPage} sections={sections} />
      )}
    </div>
  );
}
