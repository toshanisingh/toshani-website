import Link from "next/link";

// Placeholder nav. In Phase 4 these become admin-created Sections loaded from
// the database. Hardcoded here so the site renders during scaffolding.
const navLinks = [
  { href: "/blogs", label: "Blogs" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About Me" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sky-edge/60 bg-sky-softer/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary"
        >
          Toshani
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-sky-soft hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
