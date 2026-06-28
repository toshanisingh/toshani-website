import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { getSections } from "@/lib/sections";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AddSectionForm } from "./AddSectionForm";
import { renameSection, deleteSection, moveSection } from "./actions";

export default async function SectionsAdmin() {
  await requireAdmin();
  const sections = await getSections();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sections</h1>
        <p className="mt-1 text-sm text-muted">
          Create the top-level areas of your site (Blogs, Books, About Me…).
          Order controls how they appear in the navigation.
        </p>
      </div>

      <div className="rounded-xl border border-sky-edge/60 bg-white p-5">
        <AddSectionForm />
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted">No sections yet. Add your first one above.</p>
      ) : (
        <ul className="space-y-3">
          {sections.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-sky-edge/60 bg-white p-4"
            >
              {/* Rename */}
              <form action={renameSection} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={s.id} />
                <input
                  name="name"
                  defaultValue={s.name}
                  className="min-w-0 flex-1 rounded-md border border-sky-edge bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  className="rounded-md border border-sky-edge px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-sky-soft hover:text-primary"
                >
                  Save
                </button>
              </form>

              <Link
                href={`/${s.slug}`}
                className="font-mono text-xs text-accent hover:underline"
              >
                /{s.slug}
              </Link>

              {/* Reorder */}
              <div className="flex items-center gap-1">
                <form action={moveSection}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-sky-edge px-2 py-1.5 text-sm text-muted hover:bg-sky-soft disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveSection}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button
                    type="submit"
                    disabled={i === sections.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-sky-edge px-2 py-1.5 text-sm text-muted hover:bg-sky-soft disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>

              {/* Delete */}
              <form action={deleteSection}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton
                  message={`Delete “${s.name}” and all its pages? This cannot be undone.`}
                  className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
