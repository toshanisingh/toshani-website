import Link from "next/link";
import { getSectionsSafe } from "@/lib/sections";

// Nav is driven by the admin-created sections (Phase 4). Degrades to just the
// logo if there are none yet or the DB is briefly unavailable.
export async function Header() {
  const sections = await getSectionsSafe();

  return (
    <header className="sticky top-0 z-40 border-b border-sky-edge/60 bg-sky-softer/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Toshani
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-sky-soft hover:text-primary"
            >
              {s.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
